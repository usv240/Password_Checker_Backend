const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const calculateEntropy = require('./entropyCalculator'); 
const userDataPatterns = require('./userData'); 
const app = express();

app.use(express.json());
app.use(cors());

const mongoUri = 'mongodb://localhost:27017/Passwordchecker';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  birthdate: { type: String, required: false },
  phone: { type: String, required: false },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

// Function to log the password being checked and the detected patterns/mutations
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
  const matchedPatterns = patterns.filter((pattern) =>
    password.toLowerCase().includes(pattern)
  );
  console.log('Detected predictable patterns:', matchedPatterns);
  return matchedPatterns;
}

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

  console.log('Detected mutations:', detectedMutations);
  return detectedMutations.length > 0 ? detectedMutations : null;
}

// Log the data related to user prediction
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

  console.log('Password prediction warnings:', matchedPatterns);
  return matchedPatterns.length > 0 ? matchedPatterns : null;
}

// Log entropy calculation and scoring process
function calculatePasswordScore(password, userData) {
  console.log('Calculating password score for password:', password);
  const entropy = calculateEntropy(password);
  console.log('Password entropy:', entropy);

  let score = 0;

  if (entropy >= 40) score += 40;
  else if (entropy >= 20) score += 20;

  if (password.length > 6) score += 20;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

  if (/(.)\1{2,}/.test(password)) score -= 10;

  const predictionWarning = detectPasswordPrediction(password, userData);
  if (predictionWarning) {
    score -= 30;
  }

  console.log('Final password score:', score);
  return Math.min(Math.max(score, 0), 100);
}

// Log feedback about password
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

  console.log('Generated password tips:', tips);
  return tips.length > 0 ? tips : ['Your password is strong!'];
}

// Log user hash and storage process
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

function classifyPasswordStrength(score, entropy, predictionWarning) {
  // 1. Ensure prediction warning is prioritized (if present, classify as weak)
  if (predictionWarning && predictionWarning.length > 0) {
    console.log("Prediction warning detected, classifying as weak");
    return "weak"; // If prediction warning exists, classify as weak
  }

  // 2. Strong password criteria: score >= 80 and entropy >= 60
  if (score >= 80 || entropy >= 60) {
    console.log("Password classified as strong based on score >= 80 and entropy >= 60");
    return "strong"; // Strong if both score and entropy are high
  }

  // 3. Moderate password criteria (two scenarios):
  // a. High score (> 65) and low entropy (< 45)
  if (score > 65 && entropy < 45) {
    console.log("Password classified as moderate due to score above 65 and entropy below 45");
    return "moderate"; // Moderate if score is high but entropy is low
  }

  // b. Score between 60-79 and entropy between 40-59
  if ((score >= 60 && score < 80) && (entropy >= 40 && entropy < 60)) {
    console.log("Password classified as moderate based on score between 60 and 79, and entropy between 40 and 59");
    return "moderate"; // Moderate based on score and entropy ranges
  }

  // 4. Weak password criteria (all cases below):
  // a. Low score and low entropy
  if (score < 60 && entropy < 40) {
    console.log("Password classified as weak based on low score and entropy");
    return "weak"; // Weak if both score and entropy are low
  }

  // b. Low score but decent entropy (score < 60 and entropy between 40-59)
  if (score < 60 && entropy >= 40 && entropy < 60) {
    console.log("Password classified as weak due to low score and decent entropy");
    return "weak"; // Weak due to low score and decent entropy
  }

  // c. High score but low entropy (score between 60-79 and entropy < 40)
  if (score >= 60 && score < 80 && entropy < 40) {
    console.log("Password classified as weak due to high score but low entropy");
    return "weak"; // Weak due to high score but low entropy
  }

  // If none of the above conditions are met, classify as weak by default
  console.log("Password classified as weak by default");
  return "weak"; // Default to weak if no other conditions are met
}


// Endpoint to check password strength and log all results
app.post('/check-password', async (req, res) => {
  console.log('Received request to check password:', req.body);
  
  const { password, userData } = req.body;

  if (!password) {
    console.log('Password is missing');
    return res.status(400).json({ message: 'Password is required' });
  }

  if (!userData) {
    console.log('User data is missing');
    return res.status(400).json({ message: 'User data is required' });
  }

  const score = calculatePasswordScore(password, userData);
  const entropy = calculateEntropy(password);
  const mutationWarning = detectCommonMutations(password) || 'None';
  const predictionWarning = detectPasswordPrediction(password, userData) || 'None';
  const strength = classifyPasswordStrength(score, predictionWarning);
  const tips = getPasswordFeedback(password, userData);

  console.log('Password strength classification:', strength);
  console.log('Password feedback:', tips);

  const userStored = await hashAndStoreUser(password, userData);
  if (!userStored) {
    console.error('Error storing user data');
    return res.status(500).json({ message: 'Error storing the user data. Try again later.' });
  }

  return res.json({
    strength,
    score: `${score}/100`,
    entropy: entropy || 'N/A',
    mutationWarning,
    predictionWarning,
    tips,
    message: `Password strength: ${strength}`,
  });
});



const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
