// VMS_Project/backend/src/routes/userRoutes.js
const express = require('express');
// CORRECTED: Import 'getMe' and 'logoutUser' instead of 'getUserProfile'
const { registerUser, loginUser, getMe, logoutUser, getDashboardData } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator'); // For input validation

const router = express.Router();    

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with the system.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *               role:
 *                 type: string
 *                 description: The user's role (admin or vendor).
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request.
 */
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('role').isIn(['admin', 'vendor']).withMessage('Role must be admin or vendor')
    ],
    registerUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Logs in an existing user.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       400:
 *         description: Invalid credentials.
 */
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    loginUser
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieves the current user's information.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me', protect, getMe); // Changed route path to /me to align with getMe controller name

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the current user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post('/logout', protect, logoutUser); // Added logout route

/**
 * @swagger
 * /api/admin/dashboard-data:
 *   get:
 *     summary: Get admin dashboard data
 *     description: Retrieves comprehensive dashboard metrics for admin users.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.get('/dashboard-data', protect, getDashboardData);

module.exports = router;
