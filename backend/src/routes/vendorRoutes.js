const express = require('express');
const { registerVendor, getVendorProfile, updateVendorProfile, getVendors, loginVendor, getVendorById, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { initiateOnboarding } = require('../controllers/onboardingController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator'); // For input validation

const router = express.Router();

// Validation schema for vendor registration and update
const vendorValidation = [
    body('businessName').notEmpty().withMessage('Business Name is required'),
    body('contactPerson').notEmpty().withMessage('Contact Person is required'),
    body('contactEmail').isEmail().withMessage('Please include a valid contact email'),
    body('contactPhone').notEmpty().withMessage('Contact Phone is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.zipCode').notEmpty().withMessage('Zip Code is required'),
    body('bankDetails.accountNumber').notEmpty().withMessage('Account Number is required'),
    body('bankDetails.accountHolderName').notEmpty().withMessage('Account Holder Name is required'),
    body('bankDetails.accountNumber').notEmpty().withMessage('Account Number is required'),
    body('bankDetails.ifscCode').notEmpty().withMessage('IFSC Code is required'),
    body('bankDetails.bankName').notEmpty().withMessage('Bank Name is required'),
    body('bankDetails.branch').notEmpty().withMessage('Branch is required'),
    body('servicesOffered').isArray({ min: 1 }).withMessage('At least one service must be offered')
];

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors
 *     description: Retrieves a list of all vendors. Accessible only to admins.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of vendors.
 *       401:
 *         description: Unauthorized - Admin access required.
 */
router.get('/', protect, getVendors);

/**
 * @swagger
 * /api/vendors/register:
 *   post:
 *     summary: Register a new vendor
 *     description: Registers a new vendor with the system.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorRegistration'
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', protect, vendorValidation, registerVendor);

/**
 * @swagger
 * /api/vendors/profile:
 *   get:
 *     summary: Get vendor profile
 *     description: Retrieves the profile of the logged-in vendor.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile retrieved successfully.
 *       401:
 *         description: Unauthorized - Vendor access required.
 */
router.get('/profile', protect, getVendorProfile);

/**
 * @swagger
 * /api/vendors/profile:
 *   put:
 *     summary: Update vendor profile
 *     description: Updates the profile of the logged-in vendor.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorUpdate'
 *     responses:
 *       200:
 *         description: Vendor profile updated successfully.
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Vendor access required.
 */
const vendorUpdateValidation = [
    body('businessName').optional().notEmpty().withMessage('Business Name cannot be empty'),
    body('contactPerson').optional().notEmpty().withMessage('Contact Person cannot be empty'),
    body('contactEmail').optional().isEmail().withMessage('Please include a valid contact email'),
    body('contactPhone').optional().notEmpty().withMessage('Contact Phone cannot be empty'),
    body('address.street').optional().notEmpty().withMessage('Street address cannot be empty'),
    body('address.city').optional().notEmpty().withMessage('City cannot be empty'),
    body('address.state').optional().notEmpty().withMessage('State cannot be empty'),
    body('address.zipCode').optional().notEmpty().withMessage('Zip Code cannot be empty'),
    body('bankDetails.accountNumber').optional().notEmpty().withMessage('Account Number cannot be empty'),
    body('bankDetails.accountHolderName').optional().notEmpty().withMessage('Account Holder Name cannot be empty'),
    body('bankDetails.ifscCode').optional().notEmpty().withMessage('IFSC Code cannot be empty'),
    body('bankDetails.bankName').optional().notEmpty().withMessage('Bank Name cannot be empty'),
    body('bankDetails.branch').optional().notEmpty().withMessage('Branch cannot be empty'),
    body('servicesOffered').optional().isArray({ min: 1 }).withMessage('At least one service must be offered')
];

router.put('/profile', protect, vendorUpdateValidation, updateVendorProfile);

/**
 * @swagger
 * /api/vendors/{vendorId}/initiate-onboarding:
 *   post:
 *     summary: Initiate onboarding for a vendor
 *     description: Initiates the onboarding process for a specific vendor and generates a token. Accessible only to admins.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         description: ID of the vendor to initiate onboarding.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Onboarding initiated successfully.
 *       401:
 *         description: Unauthorized - Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.post('/:vendorId/initiate-onboarding', protect, initiateOnboarding);

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     description: Retrieves a vendor by their ID. Accessible only to admins.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the vendor to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor retrieved successfully.
 *       401:
 *         description: Unauthorized - Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.get('/:id', protect, getVendorById);

/**
 * @swagger
 * /api/vendors/{id}:
 *   put:
 *     summary: Update vendor by ID
 *     description: Updates a vendor by their ID. Accessible only to admins.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the vendor to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorUpdate'
 *     responses:
 *       200:
 *         description: Vendor updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized - Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.put('/:id', protect, vendorUpdateValidation, updateVendor);

/**
 * @swagger
 * /api/vendors/{id}:
 *   delete:
 *     summary: Delete vendor by ID
 *     description: Deletes a vendor by their ID. Accessible only to admins.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the vendor to delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Vendor deleted successfully.
 *       401:
 *         description: Unauthorized - Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.delete('/:id', protect, deleteVendor);

/**
 * @swagger
 * /api/vendors/login:
 *   post:
 *     summary: Login vendor
 *     description: Logs in an existing vendor.
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorLogin'
 *     responses:
 *       200:
 *         description: Vendor logged in successfully.
 *       400:
 *         description: Invalid credentials.
 */
router.post('/login', loginVendor);

module.exports = router;