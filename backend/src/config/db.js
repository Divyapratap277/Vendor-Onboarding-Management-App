// VMS_Project/backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => { // <-- ENSURE this line is exactly as shown, including async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; // <-- ENSURE this line is exactly as shown