const express = require('express');
const router = express.Router();
const {
    createBill,
    getBills,
    getBillById,
    updateBill,
    deleteBill,
    downloadBillPDF,
    generateBillPdfForExistingBill // NEW: Import the new controller function
} = require('../controllers/billController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// Validation for Bill ID in params
const billIdParamValidation = [
    param('id').isMongoId().withMessage('Bill ID is required and must be a valid MongoDB ObjectId.'),
];

// Validation for creating/updating a Bill
const billValidation = [
    body('vendor').notEmpty().withMessage('Vendor is required.'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required.'),
    body('items.*.description').notEmpty().withMessage('Item description cannot be empty.'),
    body('items.*.quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.'),
    body('items.*.unitPrice').isFloat({ gt: 0 }).withMessage('Unit price must be a positive number.'),
    body('issueDate').isISO8601().withMessage('Issue date must be a valid date.'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid date.'),
    body('totalAmount').isFloat({ gt: 0 }).withMessage('Total amount must be a positive number.'),
    body('purchaseOrder').optional().isMongoId().withMessage('Purchase Order ID must be a valid MongoDB ObjectId if provided.'),
];

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: Get all bills
 *     description: Get all bills (admin) or vendor-specific bills (vendor).
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getBills);

/**
 * @swagger
 * /api/bills/vendor:
 *   get:
 *     summary: Get bills for the authenticated vendor
 *     description: Get bills for the authenticated vendor.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/vendor', protect, authorizeRoles('vendor'), getBills);

/**
 * @swagger
 * /api/bills/{id}:
 *   get:
 *     summary: Get a single bill by ID
 *     description: Get a single bill by ID.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the bill to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
router.get('/:id', protect, billIdParamValidation, getBillById);

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Create a new bill
 *     description: Create a new bill.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendor:
 *                 type: string
 *                 description: Vendor ID.
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       description: Item description.
 *                     quantity:
 *                       type: integer
 *                       description: Item quantity.
 *                     unitPrice:
 *                       type: number
 *                       description: Item unit price.
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 description: Issue date.
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date.
 *               totalAmount:
 *                 type: number
 *                 description: Total amount.
 *               purchaseOrder:
 *                 type: string
 *                 description: Purchase Order ID.
 *     responses:
 *       201:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, authorizeRoles('admin'), billValidation, createBill);

/**
 * @swagger
 * /api/bills/{id}:
 *   put:
 *     summary: Update a bill
 *     description: Update a bill.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the bill to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendor:
 *                 type: string
 *                 description: Vendor ID.
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       description: Item description.
 *                     quantity:
 *                       type: integer
 *                       description: Item quantity.
 *                     unitPrice:
 *                       type: number
 *                       description: Item unit price.
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 description: Issue date.
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date.
 *               totalAmount:
 *                 type: number
 *                 description: Total amount.
 *               purchaseOrder:
 *                 type: string
 *                 description: Purchase Order ID.
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
router.put('/:id', protect, authorizeRoles('admin'), billIdParamValidation, billValidation, updateBill);

/**
 * @swagger
 * /api/bills/{id}:
 *   delete:
 *     summary: Delete a bill
 *     description: Delete a bill.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the bill to delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
router.delete('/:id', protect, authorizeRoles('admin'), billIdParamValidation, deleteBill);

/**
 * @swagger
 * /api/bills/{id}/generate-pdf:
 *   put:
 *     summary: Generate/Regenerate PDF for an existing Bill
 *     description: Generate/Regenerate PDF for an existing Bill.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the bill to generate PDF for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
router.put('/:id/generate-pdf', protect, authorizeRoles('admin'), billIdParamValidation, generateBillPdfForExistingBill); // NEW ROUTE

/**
 * @swagger
 * /api/bills/{id}/download:
 *   get:
 *     summary: Download a bill PDF by ID
 *     description: Download a bill PDF by ID.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the bill to download.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
router.get('/:id/download', protect, billIdParamValidation, downloadBillPDF);

module.exports = router;
