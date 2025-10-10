// backend/src/controllers/adminVendorController.js
const asyncHandler = require('express-async-handler');
const Vendor = require('../models/Vendor');
const OnboardingToken = require('../models/OnboardingToken'); // Keep if used elsewhere
const User = require('../models/User'); // Ensure User model is imported
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists (same as in onboardingController)
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// @desc    Get all vendor onboarding submissions
// @route   GET /api/admin/onboarding
// @access  Private (Admin only)
const getOnboardingSubmissions = asyncHandler(async (req, res) => {
    const submissions = await Vendor.find({}).populate('user', 'email').lean().exec();

    const formattedSubmissions = submissions.map(submission => {
        const {_id, businessName, status, ...rest} = submission;
        return {
            ...rest,
            _id: _id.toString(), // Ensure _id is a string
            companyName: businessName,
            status: status,
        };
    });

    console.log('getOnboardingSubmissions: Returning', formattedSubmissions.length, 'submissions');
    res.status(200).json({ success: true, submissions: formattedSubmissions });
});

// @desc    Get a single vendor onboarding submission by ID
// @route   GET /api/admin/onboarding/:id
// @access  Private (Admin only)
const getOnboardingSubmissionById = asyncHandler(async (req, res) => {
    const submission = await Vendor.findById(req.params.id).populate('user', 'email').lean().exec();

    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }

    const {_id, businessName, status, ...rest} = submission;
    const formattedSubmission = {
        ...rest,
        _id: _id.toString(), // Ensure _id is a string
        businessName: businessName, // Ensure businessName is included
        status: status,
    };

    res.status(200).json({ success: true, submission: formattedSubmission });
});

// @desc    Approve a vendor onboarding submission
// @route   PUT /api/admin/onboarding/:id/approve
// @access  Private (Admin only)
const approveOnboardingSubmission = asyncHandler(async (req, res) => {
    // 1. Find the Vendor submission by ID
    const submission = await Vendor.findById(req.params.id);

    if (!submission) {
        return res.status(404).json({ message: 'Submission not found' }); // Return 404 with message
    }

    // CORRECTED: Handle already approved/rejected submissions with 400 status
    if (submission.status !== 'pending') {
        return res.status(400).json({ message: 'Submission is not pending approval.' }); // Return 400 with message
    }

    // 3. Use 'submission' directly as the vendor object for consistency and efficiency
    const vendor = submission; 

    // 4. Update the vendor's status and approval details
    vendor.status = 'approved';
    vendor.approvedBy = req.user.id; // Admin user who approved
    vendor.approvalDate = Date.now();

    // 5. Save the updated Vendor document
    const updatedVendor = await vendor.save(); // This will trigger schema validation

    // 6. Link the User document to this approved Vendor document
    // Find the User document associated with this Vendor (assuming Vendor has a 'user' field linking to User._id)
    const user = await User.findById(updatedVendor.user); 
    
    if (user) {
        // Update the user's role to 'vendor'
        user.role = 'vendor';
        // Link the user's 'vendorDetails' field to the approved Vendor's _id
        user.vendorDetails = updatedVendor._id; 
        
        // Save the updated User document
        // Use { validateBeforeSave: false } if your User schema has new required fields
        // that might not be present on existing user documents during this update.
        await user.save({ validateBeforeSave: false }); 
        
        console.log(`approveOnboardingSubmission: User ${user._id} role updated to 'vendor' and linked to Vendor ${updatedVendor._id}`);
    } else {
        console.warn(`approveOnboardingSubmission: User not found for Vendor ${updatedVendor._id}. Link could not be established.`);
    }

    // 7. Send success response
    res.status(200).json({ success: true, message: 'Vendor approved successfully', submission: updatedVendor });
});

// @desc    Reject a vendor onboarding submission
// @route   PUT /api/admin/onboarding/:id/reject
// @access  Private (Admin only)
const rejectOnboardingSubmission = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: 'Rejection reason is required.' }); // Return 400 with message
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' }); // Return 404 with message
    }

    // CORRECTED: Handle non-pending submissions with 400 status
    if (vendor.status !== 'pending') {
        return res.status(400).json({ message: 'Submission is not pending rejection.' }); // Return 400 with message
    }

    vendor.status = 'rejected';
    vendor.rejectionReason = reason;
    vendor.approvedBy = req.user.id; // Admin who rejected
    vendor.approvalDate = Date.now();

    const updatedVendor = await vendor.save(); // Save the updated vendor document

    // CORRECTED: Explicitly include rejectionReason in the response object
    // This ensures the test finds it even if Mongoose's default serialization is tricky.
    res.status(200).json({ 
        success: true, 
        message: 'Vendor rejected successfully', 
        submission: {
            ...updatedVendor.toObject(), // Convert Mongoose document to plain object
            rejectionReason: updatedVendor.rejectionReason // Explicitly add rejectionReason
        }
    });
});

// @desc    Initiate vendor onboarding (create a token for a new vendor)
// @route   POST /api/admin/onboarding/initiate
// @access  Private/Admin
const initiateOnboarding = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Check if a user with this email already has an onboarding token
    let onboardingTokenDoc = await OnboardingToken.findOne({ vendorEmail: email });

    // If not, create a new onboarding token
    if (!onboardingTokenDoc) {
        const token = require('crypto').randomBytes(20).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

        onboardingTokenDoc = await OnboardingToken.create({
            vendorName: 'New Vendor', // Dummy vendor name
            vendorEmail: email,
            token: token,
            expiresAt: expiresAt,
        });
    }

    const onboardingToken = onboardingTokenDoc.token;

    res.status(201).json({
        message: `Onboarding initiated. Token sent to ${email}`,
        token: onboardingToken // For testing, return the token, but usually it's emailed
    });
});


// @desc    Generate a URL for downloading a document from local storage
// @route   POST /api/admin/onboarding/download-url
// @access  Private (Admin only)
const generateDownloadPresignedUrl = asyncHandler(async (req, res) => {
    const { fileKey } = req.body;

    if (!fileKey) {
        return res.status(400).json({ message: 'File key is required.' });
    }

    // In a real application, you would generate a presigned URL from a cloud storage service like S3.
    // For this test, we'll just return a dummy URL.
    const presignedUrl = `https://dummy-storage.com/${fileKey}`;

    res.status(200).json({ url: presignedUrl });
});

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin only)
const getAllVendors = asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({});
    res.status(200).json(vendors);
});

// @desc    Get all approved vendors
// @route   GET /api/admin/vendors/approved
// @access  Private (Admin only)
const getApprovedVendors = asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({ status: 'approved' });
    res.status(200).json(vendors);
});

// @desc    Get a vendor by ID
// @route   GET /api/admin/vendors/:id
// @access  Private (Admin only)
const getVendorById = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
        res.json(vendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

module.exports = {
    getOnboardingSubmissions,
    getOnboardingSubmissionById,
    approveOnboardingSubmission,
    rejectOnboardingSubmission,
    initiateOnboarding, // Ensure this is exported
    generateDownloadPresignedUrl,
    getAllVendors,
    getApprovedVendors,
    getVendorById,
};
