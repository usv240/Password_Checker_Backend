const userDataList = require('./userData');

// Check for password prediction defense (if password contains user-specific data)
function detectPasswordPrediction(password, userData) {
    let userSpecificPatterns = [];

    // If user data is provided, extract patterns from name, birthdate, and email
    if (userData) {
        const { name, birthdate, email } = userData;
        
        if (name) {
            const nameParts = name.split(/(?=[A-Z])/);  // Split name by uppercase (e.g., "JohnDoe" -> ["John", "Doe"])
            userSpecificPatterns.push(...nameParts);
        }

        if (birthdate) {
            userSpecificPatterns.push(birthdate);  // Add birthdate as a whole string
        }

        if (email) {
            const emailUserPart = email.split('@')[0];  // Only use part before "@"
            userSpecificPatterns.push(emailUserPart);
        }
    }

    // Check for guessable patterns in password even if no user data provided
    const defaultGuessablePatterns = ['123', 'password', 'admin'];  // Add any general patterns
    userSpecificPatterns.push(...defaultGuessablePatterns);

    // Check if the password contains any of the patterns
    let isGuessable = false;

    userSpecificPatterns.forEach((pattern) => {
        const regex = new RegExp(pattern, 'i');  // Case-insensitive search
        if (regex.test(password)) {
            isGuessable = true;
            console.log(`Password contains guessable pattern: ${pattern}`);
        }
    });

    console.log(`Prediction check - Password contains guessable information: ${isGuessable}`);
    return isGuessable;
}

// Export the function
module.exports = {
  detectPasswordPrediction
};
