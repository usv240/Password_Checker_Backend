const cors = require('cors');
const express = require('express');
const app = express();
const commonPasswords = require('./commonPasswords');
const calculateEntropy = require('./entropyCalculator');
const { detectPasswordPrediction } = require('./predictions');

// Middleware to parse JSON bodies and handle CORS
app.use(express.json());
app.use(cors());

// Password strength calculation function
function calculatePasswordScore(password) {
  let score = 0;
  if (password.length > 6) score += 20;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;

  return score;  // Total score out of 100
}

// Educative tips for improving passwords
function getPasswordTips(password) {
  let tips = [];

  if (!/[A-Z]/.test(password)) tips.push("Try adding some uppercase letters.");
  if (!/[0-9]/.test(password)) tips.push("Include at least one number.");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) tips.push("Add a special character like @ or #.");
  if (password.length < 10) tips.push("Make your password longer (at least 10 characters).");

  return tips.length ? tips : ['Your password is strong!'];
}

// Check for common mutations in the password
function detectCommonMutations(password) {
  const mutations = [
    { original: "a", mutation: "@" },
    { original: "o", mutation: "0" },
    { original: "e", mutation: "3" }
  ];

  let isPredictable = false;
  mutations.forEach(({ original, mutation }) => {
    if (password.includes(mutation)) {
      isPredictable = true;
    }
  });

  return isPredictable;
}

// Handle POST request
app.post('/check-password', (req, res) => {
  const { password, userData } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  console.log(`Received password: ${password}`);
  console.log(`Received user data: ${JSON.stringify(userData)}`);

  // Calculate password strength score
  const score = calculatePasswordScore(password);
  let strengthLabel = 'weak';

  if (score >= 80) {
    strengthLabel = 'strong';
  } else if (score >= 50) {
    strengthLabel = 'moderate';
  }

  // Provide tips for improving password
  const tips = getPasswordTips(password);

  // Check for common mutations
  const hasPredictableMutations = detectCommonMutations(password);

  // Check if password is easy to predict using the prediction logic
  const isGuessable = detectPasswordPrediction(password, userData);

  // Calculate entropy
  const entropy = calculateEntropy(password);
  const roundedEntropy = entropy.toFixed(2);

  // Return the result to the frontend
  return res.json({
    strength: strengthLabel,
    score: score + "/100", // Send score to frontend
    entropy: `${roundedEntropy} bits`,
    mutationWarning: hasPredictableMutations ? 'Your password contains common mutations like @ instead of a.' : '',
    predictionWarning: isGuessable ? 'Your password contains guessable information (e.g., part of your name, birthdate, or email).' : '',
    tips,
    message: `Password strength: ${strengthLabel}`
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
