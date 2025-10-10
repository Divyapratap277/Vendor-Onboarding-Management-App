// VMS_Project/backend/src/controllers/vendorController.js
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateTokens');
const Vendor = require('../models/Vendor');
const User = require('../models/User'); 

// @desc    Register a new vendor profile for the logged-in user
// @route   POST /api/vendors/register
// @access  Private (User must be logged in)
const registerVendor = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log("registerVendor: User ID from request:", req.user ? req.user.id : "No user");
    const {
        businessName,
        contactPerson,
        contactEmail,
        contactPhone,
        address, // This will be an object {street, city, state, zipCode, country}
        servicesOffered, // This will be an array of strings
        bankDetails
    } = req.body;

    // Ensure the logged-in user doesn't already have a vendor profile
    const existingVendor = await Vendor.findOne({ user: req.user.id });
    if (existingVendor) {
        res.status(400);
        throw new Error('User already has a vendor profile registered.');
    }

    // Check if businessName or contactEmail are already used by another vendor
    const businessNameExists = await Vendor.findOne({ businessName });
    if (businessNameExists) {
        res.status(400);
        throw new Error('Business name already in use.');
    }

    const contactEmailExists = await Vendor.findOne({ contactEmail });
    if (contactEmailExists) {
        res.status(400);
        throw new Error('Contact email already in use by another vendor.');
    }

    let vendor;
    try {
        vendor = await Vendor.create({
            user: req.user.id, // Link to the logged-in user
            businessName,
            contactPerson,
            contactEmail,
            contactPhone,
            address, // Address object will be saved directly if provided
            servicesOffered,
            bankDetails,
            status: 'pending' // Default status
        });
        console.log("registerVendor: Vendor created successfully:", vendor);
    } catch (error) {
        console.error("registerVendor: Error creating vendor:", error);
        res.status(500).json({ message: "Failed to register vendor", error: error.message });
        return;
    }

    // Optionally, update the User's role to 'vendor' if it's not already
    const user = await User.findById(req.user.id);
    if (user && user.role !== 'vendor' && user.role !== 'admin') { 
        user.role = 'vendor';
        await user.save();
    }

    res.status(201).json(vendor);
});


// @desc    Get logged-in vendor's profile
// @route   GET /api/vendors/profile
// @access  Private (User must be logged in and have a vendor profile)
const getVendorProfile = asyncHandler(async (req, res) => {
    // Find the vendor profile linked to the logged-in user
    const vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'email name role');

    if (!vendor) {
        res.status(404);
        throw new Error('Vendor profile not found for this user.');
    }

    // Log a warning if address data is missing (empty object or null)
    if (!vendor.address || Object.keys(vendor.address).length === 0 || 
        (!vendor.address.street && !vendor.address.city && !vendor.address.state && !vendor.address.zipCode)) {
        console.warn(`Vendor ${vendor._id} has incomplete or missing address data.`);
    }

    res.json(vendor);
});

// @desc    Update logged-in vendor's profile
// @route   PUT /api/vendors/profile
// @access  Private (User must be logged in and have a vendor profile)
const updateVendorProfile = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
        res.status(404);
        throw new Error('Vendor profile not found.');
    }

    // Prevent changing immutable fields by direct update
    if (req.body.status) { 
        res.status(400);
        throw new Error('Vendor status cannot be updated directly by vendor.');
    }
    if (req.body.user) { 
        res.status(400);
        throw new Error('Associated user cannot be changed.');
    }

    // Handle unique fields (businessName, contactEmail) if they are changed
    if (req.body.businessName && req.body.businessName !== vendor.businessName) {
        const businessNameExists = await Vendor.findOne({ businessName: req.body.businessName });
        if (businessNameExists && String(businessNameExists._id) !== String(vendor._id)) {
            res.status(400);
            throw new Error('Business name already in use by another vendor.');
        }
    }
    if (req.body.contactEmail && req.body.contactEmail !== vendor.contactEmail) {
        const contactEmailExists = await Vendor.findOne({ contactEmail: req.body.contactEmail });
        if (contactEmailExists && String(contactEmailExists._id) !== String(vendor._id)) {
            res.status(400);
            throw new Error('Contact email already in use by another vendor.');
        }
    }

    // Update fields dynamically, ensuring address is handled as an object
    for (const key in req.body) {
        if (key === 'address' && typeof req.body[key] === 'object' && req.body[key] !== null) {
            // Merge address sub-document, ensuring it's not null
            vendor.address = { ...vendor.address, ...req.body[key] };
        } else if (key === 'bankDetails' && typeof req.body[key] === 'object' && req.body[key] !== null) {
            // Merge bankDetails sub-document
            vendor.bankDetails = { ...vendor.bankDetails, ...req.body[key] };
        } else if (key === 'servicesOffered' && Array.isArray(req.body[key])) {
            vendor[key] = req.body[key];
        } else if (vendor[key] !== undefined) { // Only update if the field exists in the schema
            vendor[key] = req.body[key];
        }
    }

    const updatedVendor = await vendor.save();

    res.json(updatedVendor);
});

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private (Admin)
const getVendors = asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({});
    res.status(200).json({ success: true, vendors });
});

// @desc    Auth vendor & get token
// @route   POST /api/vendors/login
// @access  Public
const loginVendor = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find the vendor by contactEmail
    const vendor = await Vendor.findOne({ contactEmail: email });

    if (vendor) {
        // Now find the associated user to check the password
        const user = await User.findById(vendor.user);

        if (user && (await user.matchPassword(password))) {
            // Check if the vendor is approved
            if (vendor.status === 'approved') {
                res.json({
                    _id: vendor._id,
                    businessName: vendor.businessName,
                    contactEmail: vendor.contactEmail,
                    token: generateToken(user._id), // Generate token for the associated user ID
                });
            } else {
                res.status(400);
                throw new Error('Vendor account is not yet approved.');
            }
        } else {
            res.status(401);
            throw new Error('Invalid email or password.');
        }
    } else {
        res.status(401);
        throw new Error('Invalid email or password.');
    }
});

const getVendorById = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'email name role');

    if (!vendor) {
        res.status(404);
        throw new Error('Vendor not found');
    }

    res.json(vendor);
});

const updateVendor = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        res.status(404);
        throw new Error('Vendor not found');
    }

    // Prevent changing immutable fields by direct update
    if (req.body.user) { 
        res.status(400);
        throw new Error('Associated user cannot be changed.');
    }

    // Handle unique fields (businessName, contactEmail) if they are changed
    if (req.body.businessName && req.body.businessName !== vendor.businessName) {
        const businessNameExists = await Vendor.findOne({ businessName: req.body.businessName });
        if (businessNameExists && String(businessNameExists._id) !== String(vendor._id)) {
            res.status(400);
            throw new Error('Business name already in use by another vendor.');
        }
    }
    if (req.body.contactEmail && req.body.contactEmail !== vendor.contactEmail) {
        const contactEmailExists = await Vendor.findOne({ contactEmail: req.body.contactEmail });
        if (contactEmailExists && String(contactEmailExists._id) !== String(vendor._id)) {
            res.status(400);
            throw new Error('Contact email already in use by another vendor.');
        }
    }

    // Update fields dynamically, ensuring address is handled as an object
    for (const key in req.body) {
        if (key === 'address' && typeof req.body[key] === 'object' && req.body[key] !== null) {
            // Merge address sub-document, ensuring it's not null
            vendor.address = { ...vendor.address, ...req.body[key] };
        } else if (key === 'bankDetails' && typeof req.body[key] === 'object' && req.body[key] !== null) {
            // Merge bankDetails sub-document
            vendor.bankDetails = { ...vendor.bankDetails, ...req.body[key] };
        } else if (key === 'servicesOffered' && Array.isArray(req.body[key])) {
            vendor[key] = req.body[key];
        } else if (vendor[key] !== undefined) { // Only update if the field exists in the schema
            vendor[key] = req.body[key];
        }
    }

    const updatedVendor = await vendor.save();

    res.json(updatedVendor);
});

const deleteVendor = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        res.status(404);
        throw new Error('Vendor not found');
    }

    // Optionally, delete the associated user as well
    await User.deleteOne({ _id: vendor.user });
    await vendor.deleteOne();

    res.json({ message: 'Vendor removed' });
});

module.exports = {
    registerVendor,
    getVendorProfile,
    updateVendorProfile,
    getVendors,
    loginVendor,
    getVendorById,
    updateVendor,
    deleteVendor
};
