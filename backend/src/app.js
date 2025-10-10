 // VMS_Project/backend/src/app.js
 require('dotenv').config(); // CRITICAL: Load environment variables at the very start of app.js
 const path = require('path');
 const express = require('express');
 const cors = require('cors');
 const cookieParser = require('cookie-parser');
 const swaggerUi = require('swagger-ui-express'); // Import Swagger UI
 const swaggerSpec = require('../swagger.js'); // Import Swagger configuration
 const notificationRoutes = require('./routes/notificationRoutes'); // Import Notification routes
 const userRoutes = require('./routes/userRoutes'); // Import User routes
 const vendorRoutes = require('./routes/vendorRoutes'); // Import Vendor routes
 const onboardingRoutes = require('./routes/onboardingRoutes.js'); // Import Onboarding routes
 const adminVendorRoutes = require('./routes/adminVendorRoutes.js'); // Import Admin Vendor routes
 const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes.js'); // Import Purchase Order routes
 const billRoutes = require('./routes/billRoutes.js'); // Import Bill routes

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON requests body as JSON
// CORRECTED: Assuming 'uploads' is a sibling directory to 'src' (i.e., backend/uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); 
app.use(cookieParser()); // Parse cookies
// CORS configuration to allow your frontend domain
const corsOptions = {
  origin: [
    'http://localhost:3000', // For local development
    'http://gowo84cskcgsw40080g0c080.95.217.147.77.sslip.io', // Your frontend URL
    'https://gowo84cskcgsw40080g0c080.95.217.147.77.sslip.io' // HTTPS version if needed
  ],
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); // Enables CORS for specified origins

// API Routes
app.use('/api/vendors', vendorRoutes); // Use vendor management routes
app.use('/api/onboarding', onboardingRoutes); // Use onboarding routes
app.use('/api/admin', adminVendorRoutes); // Use admin vendor management routes
app.use('/api/purchaseorders', purchaseOrderRoutes); // Use purchase order routes
app.use('/api/bills', billRoutes); // Use bill routes
app.use('/api/users', userRoutes); // Use user routes
app.use('/api/notifications', notificationRoutes); // Use notification routes

 // Basic test route
 app.get('/', (req, res) => {
  res.send('Welcome to the VMS Backend API!');
 });

 // Serve Swagger UI
 app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 

 // Custom Error Handling Middleware
 // This middleware will catch errors thrown by asyncHandler or other parts of Express
 app.use((err, req, res, next) => {
  console.error("Caught in Global Error Handler:", err); // Log the error for debugging

    // Determine status code (default to 500 if not set)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Send a JSON response with error message and stack trace (only in development)
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

 module.exports = app;
