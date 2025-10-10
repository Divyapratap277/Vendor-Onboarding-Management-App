const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    getVendorPurchaseOrders,
    generatePurchaseOrderPDFController,
    updatePurchaseOrderStatus,
    cancelPurchaseOrder, // Export new functions
    getCancelledPurchaseOrders, // Export new functions
    restorePurchaseOrder, // Export new functions
    permanentlyDeletePurchaseOrder, // Export new functions
    deletePurchaseOrder,
} = require('../controllers/purchaseOrderController');
const mongoose = require('mongoose');

const router = express.Router();

// Validation for creating a Purchase Order (all fields required)
const createPurchaseOrderValidation = [
    body('vendor').notEmpty().withMessage('Vendor ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.description').notEmpty().withMessage('Item description is required'),
    body('items.*.quantity').isNumeric().withMessage('Item quantity must be a number'),
    body('items.*.unitPrice').isNumeric().withMessage('Item unit price must be a number'),
    body('deliveryDate').isISO8601().withMessage('Delivery date must be a valid date'),
];

// Validation for updating a Purchase Order (fields are optional, but if present, must be valid)
const updatePurchaseOrderValidation = [
    body('vendor').optional().notEmpty().withMessage('Vendor ID cannot be empty if provided'),
    body('items').optional().isArray({ min: 1 }).withMessage('At least one item is required if items array is provided'),
    body('items.*.description').optional().notEmpty().withMessage('Item description cannot be empty if provided'),
    body('items.*.quantity').optional().isNumeric().withMessage('Item quantity must be a number if provided'),
    body('items.*.unitPrice').optional().isNumeric().withMessage('Item unit price must be a number if provided'),
    body('totalAmount').optional().isNumeric().withMessage('Total amount must be a number if provided'),
    body('status').optional().isIn(['pending', 'approved', 'rejected', 'completed', 'billed', 'vendor_edited', 'admin_edited', 'cancelled']).withMessage('Invalid status if provided'), // ADDED 'cancelled'
    body('deliveryDate').optional().isISO8601().withMessage('Delivery date must be a valid date if provided'),
];


// Validation for PO ID in params
const poIdParamValidation = [
    param('id').isMongoId().withMessage('Purchase Order ID is required and must be a valid MongoDB ObjectId.'),
];

// Validation for status in body (for the dedicated status update route)
const statusBodyValidation = [
    body('status').isIn(['pending', 'approved', 'completed', 'cancelled', 'rejected', 'vendor_edited', 'admin_edited']).withMessage('Invalid PO status provided.'), // ADDED 'cancelled'
];


/**
 * @swagger
 * /api/purchaseorders:
 *   post:
 *     summary: Create a new purchase order
 *     description: Creates a new purchase order (Admin only).
 *     tags: [PurchaseOrders]
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
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *                 description: Delivery date.
 *     responses:
 *       201:
 *         description: Purchase order created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *   get:
 *     summary: Get all purchase orders
 *     description: Retrieves a list of all purchase orders (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of purchase orders.
 *       401:
 *         description: Unauthorized.
 */
router.route('/')
    .post(protect, authorizeRoles('admin'), createPurchaseOrderValidation, createPurchaseOrder)
    .get(protect, authorizeRoles('admin'), getPurchaseOrders); // getPurchaseOrders will now filter out 'cancelled'

/**
 * @swagger
 * /api/purchaseorders/vendor:
 *   get:
 *     summary: Get vendor purchase orders
 *     description: Retrieves purchase orders for the logged-in vendor.
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of purchase orders for the vendor.
 *       401:
 *         description: Unauthorized.
 */
router.route('/vendor').get(protect, authorizeRoles('vendor'), getVendorPurchaseOrders);

/**
 * @swagger
 * /api/purchaseorders/cancelled:
 *   get:
 *     summary: Get all cancelled purchase orders
 *     description: Retrieves a list of all cancelled purchase orders (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of cancelled purchase orders.
 *       401:
 *         description: Unauthorized.
 */
router.route('/cancelled')
    .get(protect, authorizeRoles('admin'), getCancelledPurchaseOrders);

/**
 * @swagger
 * /api/purchaseorders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     description: Retrieves a purchase order by ID (Admin or Vendor).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 *   put:
 *     summary: Update purchase order by ID
 *     description: Updates a purchase order by ID (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to update.
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
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *                 description: Delivery date.
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, completed, billed, vendor_edited, admin_edited, cancelled]
 *                 description: Purchase order status.
 *     responses:
 *       200:
 *         description: Purchase order updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 */
router.route('/:id')
    .get(protect, authorizeRoles('admin', 'vendor'), poIdParamValidation, getPurchaseOrderById)
    .put(protect, authorizeRoles('admin'), poIdParamValidation, updatePurchaseOrderValidation, updatePurchaseOrder); // Admin can still edit

/**
 * @swagger
 * /api/purchaseorders/{id}/generate-pdf:
 *   post:
 *     summary: Generate purchase order PDF
 *     description: Generates a PDF for a specific purchase order (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to generate PDF for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order PDF generated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 */
router.route('/:id/generate-pdf').post(protect, authorizeRoles('admin'), poIdParamValidation, generatePurchaseOrderPDFController);

/**
 * @swagger
 * /api/purchaseorders/{id}/status:
 *   put:
 *     summary: Update purchase order status
 *     description: Updates the status of a specific purchase order (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to update status for.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, completed, billed, vendor_edited, admin_edited, cancelled]
 *                 description: New purchase order status.
 *     responses:
 *       200:
 *         description: Purchase order status updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 */
router.route('/:id/status')
    .put(protect, authorizeRoles('admin'), poIdParamValidation, statusBodyValidation, updatePurchaseOrderStatus);

// --- REMOVED: Routes for Admin to approve/reject vendor-initiated edits ---
// router.route('/:id/approve-vendor-edit')
//     .post(protect, authorizeRoles('admin'), poIdParamValidation, approveVendorEditedPO);

// router.route('/:id/reject-vendor-edit')
//     .post(protect, authorizeRoles('admin'), poIdParamValidation, rejectVendorEditedPO);


/**
 * @swagger
 * /api/purchaseorders/{id}/cancel:
 *   put:
 *     summary: Cancel purchase order
 *     description: Cancels a specific purchase order (Soft Delete) (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to cancel.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order cancelled successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 */
router.route('/:id/cancel')
    .put(protect, authorizeRoles('admin'), poIdParamValidation, cancelPurchaseOrder);

/**
 * @swagger
 * /api/purchaseorders/{id}/restore:
 *   put:
 *     summary: Restore cancelled purchase order
 *     description: Restores a cancelled purchase order (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to restore.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order restored successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 */
router.route('/:id/restore')
    .put(protect, authorizeRoles('admin'), poIdParamValidation, restorePurchaseOrder);

/**
 * @swagger
 * /api/purchaseorders/{id}/permanent-delete:
 *   delete:
 *     summary: Permanently delete purchase order
 *     description: Permanently deletes a purchase order (Admin only). Use with extreme caution.
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to permanently delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Purchase order permanently deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 */
router.route('/:id/permanent-delete')
    .delete(protect, authorizeRoles('admin'), poIdParamValidation, permanentlyDeletePurchaseOrder);

/**
 * @swagger
 * /api/purchaseorders/{id}:
 *   delete:
 *     summary: Delete purchase order
 *     description: Deletes a purchase order (Admin only).
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the purchase order to delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Purchase order deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Purchase order not found.
 */
router.route('/:id')
    .delete(protect, authorizeRoles('admin'), poIdParamValidation, deletePurchaseOrder);

module.exports = router;