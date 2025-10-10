// VMS_Project/backend/src/server.js
require('dotenv').config(); // Load environment variables from .env file
const app = require('./app'); // Import the app from app.js
const connectDB = require('./config/db'); // Import database connection

// NEW: Import notification routes
const notificationRoutes = require('./routes/notificationRoutes'); // Ensure this path is correct

// Conditional database connection and server start
// This ensures the database connection only happens when server.js is run directly
// and not when it's imported by tests.
if (process.env.NODE_ENV !== 'test') { // Add this condition
    // Connect to MongoDB
    (async () => {
        await connectDB();

        // NEW: Use notification routes
        app.use('/api/notifications', notificationRoutes); // Mount notification routes

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })();
} else {
    // In test environment, we don't connect here; Mocha's before hook handles it.
    console.log('Server is in test mode, not connecting to DB or starting listener here.');
}

// Note: app.js exports the Express app instance, which is what your tests will import.
// server.js is now responsible only for starting the application conditionally.
