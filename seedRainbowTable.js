const mongoose = require('mongoose');
const commonPasswords = require('./commonPasswords'); // Import common passwords

// Define the schema for the `commonpasswords` collection
const CommonPasswordsSchema = new mongoose.Schema({
    password: { type: String, required: true, unique: true },
});

// Define the schema for the `compromisedpasswords` collection
const CompromisedPasswordsSchema = new mongoose.Schema({
    password: { type: String, required: true, unique: true },
});

// Create models for both collections
const CommonPasswords = mongoose.model('CommonPasswords', CommonPasswordsSchema);
const CompromisedPasswords = mongoose.model('CompromisedPasswords', CompromisedPasswordsSchema);

// Local list of compromised passwords
const compromisedPasswords = [
    "123456", "password", "123456789", "qwerty", "12345678", "abc123", "password1",
    "111111", "iloveyou", "123123", "letmein", "monkey", "dragon", "sunshine",
    "princess", "password123", "admin", "welcome", "football", "12345",
    "starwars", "master", "freedom", "hello", "whatever", "trustno1",
    "login", "123qwe", "1qaz2wsx", "password1234", "passw0rd", "baseball",
    "football1", "summer2020", "spring2021", "charlie", "cheese", "happy123",
    "hello123", "letmein123", "ninja", "password!", "superman", "wonderwoman",
    "batman", "shadow", "pokemon", "monday", "sunday", "mustang", "batman123"
];

// MongoDB connection URI
const mongoUri = 'mongodb://localhost:27017/Passwordchecker'; // Match exact database name case

// Function to seed a collection
const seedCollection = async (Model, data, collectionName) => {
    try {
        console.log(`Clearing existing data in the ${collectionName} collection...`);
        await Model.deleteMany();
        console.log(`Existing data cleared in the ${collectionName} collection.`);

        console.log(`Inserting passwords into the ${collectionName} collection...`);
        const skipped = [];
        const inserted = [];

        for (const password of data) {
            try {
                const result = await Model.create({ password });
                inserted.push(result.password);
            } catch (err) {
                if (err.code === 11000) {
                    skipped.push(password);
                } else {
                    console.error(`Error inserting password ${password} into ${collectionName}:`, err);
                }
            }
        }

        console.log(`Inserted passwords into ${collectionName}: ${inserted.length}`);
        if (skipped.length) {
            console.log(`Skipped (duplicates) in ${collectionName}: ${skipped.length}`);
        }
    } catch (err) {
        console.error(`Error seeding the ${collectionName} collection:`, err);
    }
};

// Connect to MongoDB and seed both collections
mongoose.connect(mongoUri)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Seed the CommonPasswords collection
        await seedCollection(CommonPasswords, commonPasswords, 'commonpasswords');

        // Seed the CompromisedPasswords collection
        await seedCollection(CompromisedPasswords, compromisedPasswords, 'compromisedpasswords');

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        mongoose.disconnect();
    });