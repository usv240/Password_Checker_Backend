
function calculateEntropy(password) {
    const possibleCharacters = getCharacterSet(password);
    const numberOfPossibleCharacters = possibleCharacters.length;
    const passwordLength = password.length;

    if (numberOfPossibleCharacters === 0 || passwordLength === 0) {
        return 0;
    }

  
    const entropy = Math.log2(numberOfPossibleCharacters) * passwordLength;
    return entropy;
}


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

module.exports = calculateEntropy;
