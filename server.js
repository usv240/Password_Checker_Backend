const cors = require('cors');
const express = require('express');
const app = express();
const commonPasswords = require('./commonPasswords');

// Middleware to parse JSON bodies and handle CORS
app.use(express.json());
app.use(cors());

// Password strength calculation function
function Strength(password) {
  let i = 0;
  if (password.length > 6) {
    i++;
  }
  if (password.length >= 10) {
    i++;
  }

  if (/[A-Z]/.test(password)) {
    i++;
  }

  if (/[0-9]/.test(password)) {
    i++;
  }

  if (/[A-Za-z0-8]/.test(password)) {
    i++;
  }

  return i;
}

// Handle POST request for password checking
app.post('/check-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  // Check if the password is common
  const isCommon = commonPasswords.includes(password);

  // Calculate password strength
  const strength = Strength(password);
  let strengthLabel = 'weak';

  if (strength <= 2) {
    strengthLabel = 'weak';
  } else if (strength >= 2 && strength <= 4) {
    strengthLabel = 'moderate';
  } else {
    strengthLabel = 'strong';
  }

  // Return the result to the frontend
  return res.json({
    common: isCommon,
    strength: strengthLabel,
    message: isCommon 
      ? 'This is a commonly used password. Please choose a stronger one.'
      : `Password strength: ${strengthLabel}`
  });
});

const calculateEntropy = require('./entropyCalculator');

// Test cases
const password1 = "abc123";
const password2 = "Gf!@6Wq9Z#";

console.log(`Entropy of "${password1}": ${calculateEntropy(password1)} bits`);
console.log(`Entropy of "${password2}": ${calculateEntropy(password2)} bits`);



const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
