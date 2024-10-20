// Entropy Calculator Module

// Function to calculate the entropy of a password
function calculateEntropy(password) {
    const possibleCharacters = getCharacterSet(password);
    const numberOfPossibleCharacters = possibleCharacters.length;
    const passwordLength = password.length;

    if (numberOfPossibleCharacters === 0 || passwordLength === 0) {
        return 0;
    }

    // Entropy formula: log2(Number of possible characters) * Password length
    const entropy = Math.log2(numberOfPossibleCharacters) * passwordLength;
    return entropy;
}

// Function to determine the set of characters used in the password
function getCharacterSet(password) {
    let charset = "";

    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    const numbers = /[0-9]/;
    const symbols = /[!@#\$%\^\&*\)\(+=._-]+/;

    if (lowercase.test(password)) charset += "abcdefghijklmnopqrstuvwxyz";
    if (uppercase.test(password)) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numbers.test(password)) charset += "0123456789";
    if (symbols.test(password)) charset += "!@#$%^&*()_+-=[]{}|;':\",./<>?";

    return charset;
}

// // Example usage
// const password1 = "abc123";
// const password2 = "Gf!@6Wq9Z#";

// console.log(`Entropy of "${password1}": ${calculateEntropy(password1)} bits`);
// console.log(`Entropy of "${password2}": ${calculateEntropy(password2)} bits`);

module.exports = calculateEntropy;
