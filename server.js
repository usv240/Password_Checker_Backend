const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const calculateEntropy = require('./entropyCalculator'); // Assuming this file exists
const userDataPatterns = require('./userData'); // Assuming this file exists
const app = express();

// Middleware to parse JSON bodies and handle CORS
app.use(express.json());
app.use(cors());

// MongoDB connection
const mongoUri = 'mongodb://localhost:27017/Passwordchecker';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define schema and models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  birthdate: { type: String, required: false },
  phone: { type: String, required: false },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

// Advanced Pattern Matching: Keyboard Sequences and Predictable Patterns
function detectPredictablePatterns(password) {
  const patterns = [
    'qwerty',
    'asdf',
    'zxcv',
    '12345',
    '67890',
    'abcd',
    'password',
    'admin',
    'letmein',
    'welcome',
  ];
  return patterns.filter((pattern) =>
    password.toLowerCase().includes(pattern)
  );
}

// Detect common mutations in the password
function detectCommonMutations(password) {
  const mutations = [
    { original: 'a', mutation: '@' },
    { original: 'o', mutation: '0' },
    { original: 'e', mutation: '3' },
    { original: 'i', mutation: '1' },
    { original: 's', mutation: '$' },
  ];

  let detectedMutations = [];
  mutations.forEach(({ original, mutation }) => {
    if (password.includes(mutation)) {
      detectedMutations.push({ original, mutation });
    }
  });

  return detectedMutations.length > 0 ? detectedMutations : null;
}

// Detect if the password includes predictable or user-specific data
function detectPasswordPrediction(password, userData) {
  let matchedPatterns = [];

  if (userData) {
    const { name, birthdate, email } = userData;

    if (name && password.toLowerCase().includes(name.toLowerCase())) {
      matchedPatterns.push('name');
    }

    if (birthdate && password.includes(birthdate.replace(/-/g, ''))) {
      matchedPatterns.push('birthdate');
    }

    if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      matchedPatterns.push('email');
    }
  }

  return matchedPatterns.length > 0 ? matchedPatterns : null;
}

// Password Strength Calculation
function calculatePasswordScore(password) {
  const entropy = calculateEntropy(password);
  let score = 0;

  if (entropy >= 40) score += 40;
  else if (entropy >= 20) score += 20;

  if (password.length > 6) score += 20;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

  if (/(.)\1{2,}/.test(password)) score -= 10;

  return Math.min(Math.max(score, 0), 100);
}

// Password Feedback Generation
function getPasswordFeedback(password, userData) {
  const tips = [];
  const predictablePatterns = detectPredictablePatterns(password);

  if (!/[A-Z]/.test(password)) tips.push('Add uppercase letters to improve strength.');
  if (!/[0-9]/.test(password)) tips.push('Include numbers to make your password stronger.');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    tips.push('Use special characters like @ or #.');
  if (password.length < 10) tips.push('Increase the length to at least 10 characters.');
  if (/(.)\1{2,}/.test(password)) tips.push('Avoid repeated characters (e.g., aaa111).');

  if (predictablePatterns.length > 0) {
    tips.push(`Avoid predictable patterns like ${predictablePatterns.join(', ')}.`);
  }

  if (userData) {
    const { name, birthdate, email } = userData;
    if (name && password.toLowerCase().includes(name.toLowerCase())) {
      tips.push('Avoid using your name in your password.');
    }
    if (birthdate && password.includes(birthdate.replace(/-/g, ''))) {
      tips.push('Avoid using your birthdate in your password.');
    }
    if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      tips.push('Avoid using your email in your password.');
    }
  }

  return tips.length > 0 ? tips : ['Your password is strong!'];
}

// Hash and store the user data securely
async function hashAndStoreUser(password, userData) {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      passwordHash: hashedPassword,
      name: userData.name,
      email: userData.email,
      birthdate: userData.birthdate,
      phone: userData.phone,
    });
    await newUser.save();
    console.log('User data successfully hashed and stored.');
    return true;
  } catch (error) {
    console.error('Error hashing or storing user data:', error);
    return false;
  }
}

// Handle POST request for password checking
app.post('/check-password', async (req, res) => {
  const { password, userData } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  if (!userData) {
    return res.status(400).json({ message: 'User data is required' });
  }

  const score = calculatePasswordScore(password);
  const entropy = calculateEntropy(password);
  const mutationWarning = detectCommonMutations(password) || 'None';
  const predictionWarning = detectPasswordPrediction(password, userData) || 'None';
  const tips = getPasswordFeedback(password, userData);

  const userStored = await hashAndStoreUser(password, userData);
  if (!userStored) {
    return res.status(500).json({ message: 'Error storing the user data. Try again later.' });
  }

  return res.json({
    strength: score >= 80 ? 'strong' : score >= 50 ? 'moderate' : 'weak',
    score: `${score}/100`,
    entropy: entropy || 'N/A',
    mutationWarning,
    predictionWarning,
    tips,
    message: `Password strength: ${
      score >= 80 ? 'strong' : score >= 50 ? 'moderate' : 'weak'
    }`,
  });
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
