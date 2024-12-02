const userDataList = require('./userData');


function detectPasswordPrediction(password, userData) {
    let userSpecificPatterns = [];


    if (userData) {
        const { name, birthdate, email } = userData;
        
        if (name) {
            const nameParts = name.split(/(?=[A-Z])/);  
            userSpecificPatterns.push(...nameParts);
        }

        if (birthdate) {
            userSpecificPatterns.push(birthdate);  
        }

        if (email) {
            const emailUserPart = email.split('@')[0];  
            userSpecificPatterns.push(emailUserPart);
        }
    }


    const defaultGuessablePatterns = ['123', 'password', 'admin'];  
    userSpecificPatterns.push(...defaultGuessablePatterns);


    let isGuessable = false;

    userSpecificPatterns.forEach((pattern) => {
        const regex = new RegExp(pattern, 'i');  
        if (regex.test(password)) {
            isGuessable = true;
            console.log(`Password contains guessable pattern: ${pattern}`);
        }
    });

    console.log(`Prediction check - Password contains guessable information: ${isGuessable}`);
    return isGuessable;
}


module.exports = {
  detectPasswordPrediction
};
