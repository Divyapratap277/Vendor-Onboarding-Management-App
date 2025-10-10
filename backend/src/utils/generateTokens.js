// backend/src/utils/generateTokens.js
require('dotenv').config(); // Failsafe: Ensure environment variables are loaded here too

const jwt = require('jsonwebtoken');

// Modified to accept 'id' and 'role' and include both in the token
const generateToken = (id, role) => { // Added 'role' parameter
    // Ensure JWT_SECRET and JWT_EXPIRES_IN are set in your .env file
    // console.log('DEBUG: JWT_SECRET in generateToken:', process.env.JWT_SECRET ? 'LOADED' : 'NOT LOADED'); // Debugging line
    if (!process.env.JWT_SECRET) {
        console.error('ERROR: JWT_SECRET is not defined in environment variables.');
        throw new Error('JWT_SECRET must be defined in environment variables.');
    }
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { // Included 'role' in the payload
        expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Provide a default if not set
    });
};

module.exports = generateToken;
