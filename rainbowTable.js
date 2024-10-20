// rainbowTable.js

// List of compromised passwords (add more as necessary)
const compromisedPasswords = [
    "123456", "password", "123456789", "qwerty", "12345678", "abc123", "password1",
    "111111", "iloveyou", "123123", "letmein", "monkey", "dragon", "sunshine",
    "princess", "password123", "admin", "welcome", "football", "12345",
    "starwars", "master", "freedom", "hello", "whatever", "trustno1",
    "login", "123qwe", "1qaz2wsx", "password1234", "passw0rd", "baseball",
    "football1", "summer2020", "spring2021", "charlie", "cheese", "happy123",
    "hello123", "letmein123", "ninja", "password!", "superman", "wonderwoman",
    "batman", "shadow", "pokemon", "monday", "sunday", "mustang", "batman123",
    // Add 150+ more entries to complete the rainbow table list
];

// Function to check if a password is compromised
function isPasswordCompromised(password) {
    return compromisedPasswords.includes(password);
}

module.exports = {
    isPasswordCompromised
};
