# Password Strength Checker - Backend

This repository contains the **backend implementation** of the Password Strength Checker application. It provides APIs to analyze password strength based on entropy, mutation warnings, predictable patterns, and user-specific data.

---

## Features
- Calculates password entropy.
- Detects predictable patterns and keyboard sequences.
- Identifies common mutations (e.g., "@" instead of "a").
- Provides feedback to improve password strength.
- Securely hashes and stores user data using bcrypt.
- RESTful API for frontend integration.

---

## Technologies Used
- Node.js
- Express.js
- Mongoose (MongoDB)
- bcrypt.js

---

## Installation Instructions

### Prerequisites
- **Node.js** (v14+)
- **MongoDB**

---

### Steps to Run the Backend

1. **Clone the repository**:
   ```bash
   git clone https://github.com/usv240/Password_Checker_Backend.git
   cd Password_Checker_Backend
   
2. **Install dependencies**:

npm install

3. **Configure MongoDB: Ensure MongoDB is running locally and update the connection string in the code (if necessary)**:

mongodb://localhost:27017/Passwordchecker

4. **Start the backend server**:

    npm start

The backend will run on http://localhost:3002 by default.
API Endpoints
POST /check-password

    Description: Analyzes the strength of a password and provides feedback.
    Request Body:

{
  "password": "examplePassword123",
  "userData": {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "birthdate": "1990-01-01"
  }
}

Response:

    {
      "strength": "weak",
      "score": "40/100",
      "entropy": "32.9 bits",
      "mutationWarning": "None",
      "predictionWarning": "None",
      "tips": ["Add uppercase letters to improve strength."]
    }

Related Repository

The frontend for this project can be found here:

    [Password Checker Frontend](https://github.com/usv240/Password_Checker_Frontend)

For a combined backend and frontend implementation, visit the monorepo:

    [Monorepo](https://github.com/usv240/password-strength-checker)
