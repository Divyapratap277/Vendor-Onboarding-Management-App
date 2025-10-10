// VMS_Project/backend/src/controllers/userController.js
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateTokens'); // This is your utility
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'vendor' // Ensure role is handled based on your schema enum
    });

    if (user) {
        res.status(201).json({
            token: generateToken(user._id, user.role), // NEW: Pass user.role here
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login request received:', { email });

    // Check for user email
    const user = await User.findOne({ email });
    console.log('User found:', user);

    if (!user || !(await user.matchPassword(password))) {
        console.log('Password match failed for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Login successful
    const token = generateToken(user._id, user.role); // NEW: Pass user.role here
    console.log('Login successful. User ID:', user._id, 'Role:', user.role);
    res.json({
        token: token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            vendorDetails: user.vendorDetails, // Include vendorDetails if present
        }
    });
});

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the protect middleware.
    // It contains the full user object if authMiddleware fetches it.
    // Ensure req.user exists and has an _id
    if (!req.user || !req.user._id) {
        // This case should ideally be caught by protect middleware, but as a safeguard
        return res.status(401).json({ message: 'Not authorized, user data missing from token.' });
    }

    const user = await User.findById(req.user._id).select('-password').populate('vendorDetails');

    if (!user) {
        return res.status(404).json({ message: 'User profile not found.' }); // More specific message
    }

    // Explicitly send the response
    res.status(200).json({
        success: true,
        user, // This will include id, name, email, role, vendorDetails (if populated)
    });
});

// @desc    Log out user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    // For JWT, logout is primarily client-side token removal.
    // If you use http-only cookies, you might clear it here.
    // For this setup, simply sending a success message is sufficient.
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard-data
// @access  Private (Admin only)
const getDashboardData = asyncHandler(async (req, res) => {
    try {
        // Get basic vendor counts
        const totalVendors = await Vendor.countDocuments();
        const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
        const approvedVendors = await Vendor.countDocuments({ status: 'approved' });
        const rejectedVendors = await Vendor.countDocuments({ status: 'rejected' });

        // Get vendor registration data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentVendors = await Vendor.find({
            registrationDate: { $gte: thirtyDaysAgo }
        }).sort({ registrationDate: 1 });

        // Calculate monthly growth
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setDate(1);

        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);

        const lastMonthCount = await Vendor.countDocuments({
            registrationDate: { $gte: lastMonthStart, $lt: thisMonthStart }
        });

        const thisMonthCount = await Vendor.countDocuments({
            registrationDate: { $gte: thisMonthStart }
        });

        // Calculate weekly growth
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyGrowth = await Vendor.countDocuments({
            registrationDate: { $gte: weekAgo }
        });

        // Calculate conversion rate (approved vs total)
        const conversionRate = totalVendors > 0 ? ((approvedVendors / totalVendors) * 100).toFixed(1) : 0;

        // Calculate average processing time
        const processedVendors = await Vendor.find({
            status: { $in: ['approved', 'rejected'] },
            approvalDate: { $exists: true }
        });

        let totalProcessingDays = 0;
        processedVendors.forEach(vendor => {
            if (vendor.approvalDate && vendor.registrationDate) {
                const diffTime = Math.abs(vendor.approvalDate - vendor.registrationDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalProcessingDays += diffDays;
            }
        });

        const avgProcessingDays = processedVendors.length > 0
            ? (totalProcessingDays / processedVendors.length).toFixed(1)
            : 0;

        // Calculate growth rate
        const growthRate = lastMonthCount > 0
            ? (((thisMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1)
            : thisMonthCount > 0 ? 100 : 0;

        // Calculate success rate (approved / (approved + rejected))
        const processedTotal = approvedVendors + rejectedVendors;
        const successRate = processedTotal > 0 ? ((approvedVendors / processedTotal) * 100).toFixed(1) : 0;

        // Get rejection reasons breakdown
        const rejectedWithReasons = await Vendor.aggregate([
            { $match: { status: 'rejected' } },
            { $group: { _id: null, total: { $sum: 1 } } }
        ]);

        // Simulate rejection reasons distribution (in real app, you'd track actual reasons)
        const rejectionReasons = {
            documentation: rejectedVendors > 0 ? Math.round(rejectedVendors * 0.6) : 0,
            compliance: rejectedVendors > 0 ? Math.round(rejectedVendors * 0.4) : 0
        };

        // Generate chart data for the last 7 days
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dayCount = await Vendor.countDocuments({
                registrationDate: { $gte: dayStart, $lte: dayEnd }
            });

            chartData.push({
                date: dayStart.toISOString().split('T')[0],
                applications: dayCount,
                approvals: Math.round(dayCount * 0.8) // Simulated approval rate
            });
        }

        // Calculate system health score based on various factors
        const systemHealthScore = Math.min(100, Math.round(
            (parseFloat(conversionRate) * 0.4) +
            (parseFloat(successRate) * 0.3) +
            (Math.max(0, 100 - parseFloat(avgProcessingDays) * 10) * 0.3)
        ));

        const systemHealthStatus = systemHealthScore >= 90 ? 'Excellent' :
                                 systemHealthScore >= 75 ? 'Good' :
                                 systemHealthScore >= 60 ? 'Fair' : 'Needs Attention';

        // Determine quality score
        const qualityScore = parseFloat(conversionRate) >= 85 ? 'A+' :
                           parseFloat(conversionRate) >= 75 ? 'A' :
                           parseFloat(conversionRate) >= 65 ? 'B+' :
                           parseFloat(conversionRate) >= 55 ? 'B' : 'C';

        const dashboardData = {
            performanceMetrics: {
                conversionRate: parseFloat(conversionRate),
                avgProcessingDays: parseFloat(avgProcessingDays),
                growthRate: parseFloat(growthRate),
                qualityScore: qualityScore
            },
            systemHealth: {
                score: systemHealthScore,
                status: systemHealthStatus
            },
            weeklyGrowth: weeklyGrowth,
            monthlyGrowth: thisMonthCount,
            successRate: parseFloat(successRate),
            avgProcessingTime: `${avgProcessingDays} days`,
            chartData: chartData,
            rejectionReasons: {
                documentation: Math.round((rejectionReasons.documentation / Math.max(rejectedVendors, 1)) * 100),
                compliance: Math.round((rejectionReasons.compliance / Math.max(rejectedVendors, 1)) * 100)
            }
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

module.exports = { registerUser, loginUser, getMe, logoutUser, getDashboardData };
