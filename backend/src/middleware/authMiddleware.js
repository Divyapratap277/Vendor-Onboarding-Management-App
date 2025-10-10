// VMS_Project/backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Protect routes - checks for JWT and populates req.user
const protect = asyncHandler(async (req, res, next) => {
    console.log('\n--- AuthMiddleware: protect function started ---');
    let token;

    // 1. Check for token in cookies first
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('AuthMiddleware: Token found in cookies.');
    }
    // 2. Then check for token in Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('AuthMiddleware: Token found in Authorization header.');
    }

    // If no token is found, send 401 Unauthorized
    if (!token) {
        console.error('AuthMiddleware: No token found. Sending 401.');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token using the JWT_SECRET from environment variables
        console.log('AuthMiddleware: Attempting to verify token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('AuthMiddleware: Decoded JWT Payload:', decoded); // CRITICAL LOG: What's inside the token?

        // Always find the user from the User model using the decoded ID.
        // The decoded.id should correspond to the _id of a User document.
        // Populate 'vendorDetails' if the user is a vendor, so it's readily available.
        console.log(`AuthMiddleware: Looking for User with ID: ${decoded.id} and role: ${decoded.role}`);
        req.user = await User.findById(decoded.id).select('-password').populate('vendorDetails');
        console.log('AuthMiddleware: User found (or null):', req.user ? `ID: ${req.user._id}, Email: ${req.user.email}, Role: ${req.user.role}, VendorDetails: ${req.user.vendorDetails}` : 'None');


        // If user is not found, send 401 Unauthorized
        if (!req.user) {
            console.error('AuthMiddleware: User not found for decoded ID. Sending 401.');
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // Optional: Add a check to ensure the role in the token matches the role in the DB
        // This adds an extra layer of security.
        if (req.user.role !== decoded.role) {
            console.warn(`AuthMiddleware: Role mismatch for user ${req.user.email}. Token role: ${decoded.role}, DB role: ${req.user.role}. Sending 403.`);
            return res.status(403).json({ message: 'Not authorized, role mismatch.' });
        }

        console.log('AuthMiddleware: protect middleware completed successfully. Calling next().');
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('AuthMiddleware: Token verification failed in catch block:', error.message);

        if (error instanceof jwt.JsonWebTokenError) {
            console.error('AuthMiddleware: JWT Error type:', error.name);
            return res.status(401).json({ message: 'Not authorized, token invalid or expired.' });
        }
        console.error('AuthMiddleware: Unexpected error during token processing. Sending 401.');
        return res.status(401).json({ message: 'Not authorized, token failed.' });
    } finally {
        console.log('--- AuthMiddleware: protect function finished ---\n');
    }
});

// @desc    Authorize roles - checks if the authenticated user has one of the allowed roles
const authorizeRoles = (...roles) => {
    const allowedRoles = roles.flat();
    console.log(`AuthMiddleware: authorizeRoles called. Required roles: ${allowedRoles.join(', ')}`);

    return (req, res, next) => {
        console.log('AuthMiddleware: authorizeRoles: Checking user role...');
        console.log('AuthMiddleware: authorizeRoles: req.user:', req.user ? `ID: ${req.user._id}, Role: ${req.user.role}` : 'None');

        if (!req.user) {
            console.warn('AuthMiddleware: authorizeRoles: req.user is null/undefined. This should be caught by protect. Sending 403.');
            return res.status(403).json({ message: 'Not authorized, user data missing.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.warn(`AuthMiddleware: authorizeRoles: User ${req.user.email} (Role: ${req.user.role}) is not in allowed roles: ${allowedRoles.join(', ')}. Sending 403.`);
            return res.status(403).json({ message: 'Not authorized to access this route.' });
        }

        console.log('AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().');
        next();
    };
};

module.exports = {
    protect,
    authorizeRoles
};
