const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VMS Backend API Documentation',
            version: '1.0.0',
            description: 'Documentation for the Vendor Management System API',
        },
    },
    apis: [
        './src/routes/userRoutes.js',
        './src/routes/vendorRoutes.js',
        './src/routes/billRoutes.js',
        './src/routes/notificationRoutes.js',
        './src/routes/onboardingRoutes.js',
        './src/routes/purchaseOrderRoutes.js',
        './src/routes/adminVendorRoutes.js',
        './src/models/Vendor.js',
    ], // Path to the API routes and models
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;