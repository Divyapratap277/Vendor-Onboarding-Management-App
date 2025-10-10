const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { initiateOnboarding, verifyToken, generateUploadPresignedUrl, confirmDocumentUpload, completeOnboarding } = require('../controllers/onboardingController');

const router = express.Router();

// Debug endpoint to check server time
router.get('/debug/server-time', (req, res) => {
  const serverTime = new Date();
  const serverTimestamp = Date.now();
  const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  res.json({
    serverTime: serverTime.toISOString(),
    serverTimestamp,
    serverTimezone,
    serverTimeLocal: serverTime.toLocaleString(),
    serverTimeUTC: serverTime.toUTCString(),
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV || 'development'
  });
});

// Configure Multer for local file storage
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/onboarding/initiate:
 *   post:
 *     summary: Initiate onboarding and generate token
 *     description: Initiate onboarding and generate token.
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Onboarding initiated.
 *       401:
 *         description: Unauthorized.
 */
router.post('/initiate', initiateOnboarding);

/**
 * @swagger
 * /api/onboarding/{token}:
 *   get:
 *     summary: Verify onboarding token
 *     description: Verify onboarding token.
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Onboarding token.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Token verified.
 *       400:
 *         description: Invalid token.
 */
router.get('/:token', verifyToken);

/**
 * @swagger
 * /api/onboarding/complete:
 *   post:
 *     summary: Complete vendor onboarding with full details
 *     description: Complete vendor onboarding with full details.
 *     tags: [Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define properties here based on the expected request body
 *     responses:
 *       200:
 *         description: Success. Onboarding completed.
 *       400:
 *         description: Bad Request.
 */
router.post('/complete', completeOnboarding);

/**
 * @swagger
 * /api/onboarding/generate-upload-url:
 *   post:
 *     summary: Generate a presigned URL for document upload
 *     description: Generate a presigned URL for document upload (now local path).
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Presigned URL generated.
 *       401:
 *         description: Unauthorized.
 */
router.post('/generate-upload-url', generateUploadPresignedUrl);

/**
 * @swagger
 * /api/onboarding/confirm-upload:
 *   post:
 *     summary: Confirm document upload and record details
 *     description: Confirm document upload and record details (now handles actual file upload).
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The document to upload.
 *     responses:
 *       200:
 *         description: Success. Document upload confirmed.
 *       400:
 *         description: Bad Request.
 *       401:
 *         description: Unauthorized.
 */
router.post('/confirm-upload', upload.single('document'), confirmDocumentUpload);

module.exports = router;