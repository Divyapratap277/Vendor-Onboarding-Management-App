const express = require('express');
const { protect, authorizeRoles: authorize } = require('../middleware/authMiddleware');
const {
    getOnboardingSubmissions,
    getOnboardingSubmissionById,
    approveOnboardingSubmission,
    rejectOnboardingSubmission,
    initiateOnboarding, // IMPORT THIS FUNCTION
    generateDownloadPresignedUrl,
    getAllVendors,
    getApprovedVendors,
    getVendorById,
} = require('../controllers/adminVendorController');

const router = express.Router();

// All routes in this file are admin-only
router.use(protect);
router.use(authorize(['admin']));

/**
 * @swagger
 * /api/admin/onboarding/initiate:
 *   post:
 *     summary: Initiate vendor onboarding
 *     description: Initiate vendor onboarding (create a token for a new vendor).
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Onboarding initiated.
 *       401:
 *         description: Unauthorized.
 */
router.post('/onboarding/initiate', initiateOnboarding); // ADDED THIS ROUTE

/**
 * @swagger
 * /api/admin/onboarding:
 *   get:
 *     summary: Get all vendor onboarding submissions
 *     description: Get all vendor onboarding submissions.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Returns a list of onboarding submissions.
 *       401:
 *         description: Unauthorized.
 */
router.get('/onboarding', getOnboardingSubmissions);

/**
 * @swagger
 * /api/admin/onboarding/{id}:
 *   get:
 *     summary: Get a single vendor onboarding submission by ID
 *     description: Get a single vendor onboarding submission by ID.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the onboarding submission to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Returns the onboarding submission.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Onboarding submission not found.
 */
router.get('/onboarding/:id', getOnboardingSubmissionById);

/**
 * @swagger
 * /api/admin/onboarding/{id}/approve:
 *   put:
 *     summary: Approve a vendor onboarding submission
 *     description: Approve a vendor onboarding submission.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the onboarding submission to approve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Onboarding submission approved.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Onboarding submission not found.
 */
router.put('/onboarding/:id/approve', approveOnboardingSubmission);

/**
 * @swagger
 * /api/admin/onboarding/{id}/reject:
 *   put:
 *     summary: Reject a vendor onboarding submission
 *     description: Reject a vendor onboarding submission.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the onboarding submission to reject.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Onboarding submission rejected.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Onboarding submission not found.
 */
router.put('/onboarding/:id/reject', rejectOnboardingSubmission);

/**
 * @swagger
 * /api/admin/onboarding/download-url:
 *   post:
 *     summary: Generate a presigned URL for downloading a document from S3
 *     description: Generate a presigned URL for downloading a document from S3.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: The key of the document in S3.
 *     responses:
 *       200:
 *         description: Success. Returns the presigned URL.
 *       401:
 *         description: Unauthorized.
 */
router.post('/onboarding/download-url', generateDownloadPresignedUrl);

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get all vendors
 *     description: Get all vendors.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Returns a list of all vendors.
 *       401:
 *         description: Unauthorized.
 */
router.get('/vendors', getAllVendors);

/**
 * @swagger
 * /api/admin/vendors/approved:
 *   get:
 *     summary: Get all approved vendors
 *     description: Get all approved vendors.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Returns a list of approved vendors.
 *       401:
 *         description: Unauthorized.
 */
router.get('/vendors/approved', getApprovedVendors);

/**
 * @swagger
 * /api/admin/vendors/{id}:
 *   get:
 *     summary: Get a vendor by ID
 *     description: Get a vendor by ID.
 *     tags: [AdminVendors]
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
 *         description: Success. Returns the vendor.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Vendor not found.
 */
router.get('/vendors/:id', getVendorById);

module.exports = router;
