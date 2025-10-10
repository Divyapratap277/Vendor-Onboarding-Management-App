const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const PurchaseOrder = require('../models/PurchaseOrder');
const Bill = require('../models/Bill');
const Vendor = require('../models/Vendor');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const generatePurchaseOrderPDF = require('../utils/pdf/generatePurchaseOrderPDF');

// Helper function to check for valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


// @desc    Create new Purchase Order
// @route   POST /api/purchaseorders
// @access  Private (Admin)
const createPurchaseOrder = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { vendor, items, deliveryDate } = req.body;

    const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const existingVendor = await Vendor.findById(vendor);
    if (!existingVendor || existingVendor.status !== 'approved') {
        return res.status(400).json({ message: 'Vendor not found or not approved.' });
    }

    const purchaseOrder = await PurchaseOrder.create({
        vendor: existingVendor._id,
        items,
        totalAmount,
        deliveryDate,
        issueDate: Date.now(),
        status: 'pending',
        orderNumber: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    res.status(201).json(purchaseOrder);
});

// @desc    Get all Purchase Orders (for Admin)
// @route   GET /api/purchaseorders
// @access  Private (Admin)
const getPurchaseOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    let query = { status: { $ne: 'cancelled' } }; // Exclude cancelled POs by default
    if (status) {
        query.status = status; // If a specific status is requested, override the default filter
    }
    const purchaseOrders = await PurchaseOrder.find(query).populate('vendor', 'businessName');
    res.status(200).json(purchaseOrders);
});

// @desc    Generate PDF for a Purchase Order
// @route   POST /api/purchaseorders/:id/generate-pdf
// @access  Private (Admin)
const generatePurchaseOrderPDFController = asyncHandler(async (req, res) => {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id).populate('vendor');

    if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase Order not found' });
    }

    const relativePdfPath = await generatePurchaseOrderPDF(purchaseOrder);

    purchaseOrder.pdfPath = relativePdfPath;
    purchaseOrder.pdfFileName = relativePdfPath.split('/').pop();
    const savedPO = await purchaseOrder.save();

    console.log(`PO saved with PDF path: ${savedPO.pdfPath}, filename: ${savedPO.pdfFileName}`);
    console.log('Saved PO object:', savedPO);

    res.status(200).json({ success: true, message: 'PDF generated successfully', pdfPath: relativePdfPath, pdfFileName: purchaseOrder.pdfFileName });
});

// @desc    Get Purchase Order by ID
// @route   GET /api/purchaseorders/:id
// @access  Private (Admin, Vendor)
const getPurchaseOrderById = asyncHandler(async (req, res) => {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id).populate('vendor', 'businessName contactEmail');

    if (req.user.role === 'vendor') {
        const vendorUser = await User.findById(req.user.id).select('vendorDetails');

        if (!vendorUser || !vendorUser.vendorDetails) {
            return res.status(403).json({ message: 'No associated vendor profile found for this user.' });
        }

        // Check if the purchase order has a vendor associated with it
        // AND if that vendor's ID matches the logged-in vendor's details.
        // If purchaseOrder.vendor is null, the first part of the condition will be false,
        // and the second part (accessing ._id) will not be evaluated.
        if (purchaseOrder.vendor && String(purchaseOrder.vendor._id) === String(vendorUser.vendorDetails)) {
            // Authorized to view
            res.status(200).json(purchaseOrder);
        } else {
            // Not authorized to view (either no vendor on PO, or vendor mismatch)
            return res.status(403).json({ message: 'Not authorized to view this purchase order.' });
        }
    } else { // Admin role or other roles can view
        res.status(200).json(purchaseOrder);
    }
});

// @desc    Update Purchase Order (Admin)
// @route   PUT /api/purchaseorders/:id
// @access  Private (Admin)
const updatePurchaseOrder = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation Errors for Admin Update:', errors.array());
        return res.status(400).json({ message: 'Validation failed for admin update', errors: errors.array() });
    }

    const { vendor, items, totalAmount, status, deliveryDate } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase Order not found' });
    }

    if (vendor) purchaseOrder.vendor = vendor;
    if (items) {
        purchaseOrder.items = items;
        purchaseOrder.totalAmount = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    }
    if (totalAmount !== undefined) purchaseOrder.totalAmount = totalAmount;

    const originalStatus = purchaseOrder.status;
    const finalStates = ['approved', 'rejected', 'completed', 'billed'];

    if (status && status !== originalStatus) {
        purchaseOrder.status = status;
    } else if (!finalStates.includes(originalStatus) && originalStatus !== 'cancelled') {
        purchaseOrder.status = 'admin_edited';
    }

    if (deliveryDate) purchaseOrder.deliveryDate = deliveryDate;

    const updatedPurchaseOrder = await purchaseOrder.save();

    if (updatedPurchaseOrder.vendor) {
        const vendorUser = await User.findOne({ vendorDetails: updatedPurchaseOrder.vendor });
        if (vendorUser) {
            await Notification.create({
                recipient: vendorUser._id,
                message: `Purchase Order #${updatedPurchaseOrder.orderNumber} has been updated by the admin.`,
                type: 'PO_ADMIN_UPDATED',
                relatedId: updatedPurchaseOrder._id,
                relatedModel: 'PurchaseOrder',
                isRead: false,
            });
        }
    }

    res.status(200).json(updatedPurchaseOrder);
});


// @desc    Get all Purchase Orders for a specific vendor
// @route   GET /api/purchaseorders/vendor
// @access  Private (Vendor)
const getVendorPurchaseOrders = asyncHandler(async (req, res) => {
    console.log('Backend: getVendorPurchaseOrders called.');
    console.log('Backend: req.user from protect middleware:', req.user);

    if (!req.user || !req.user._id) {
        console.error('Backend: getVendorPurchaseOrders: req.user is missing or invalid.');
        return res.status(401).json({ message: 'Not authorized, user data missing.' });
    }

    if (req.user.role !== 'vendor') {
        console.error(`Backend: getVendorPurchaseOrders: User role is ${req.user.role}, not 'vendor'.`);
        return res.status(403).json({ message: 'Forbidden: Only vendors can access this resource.' });
    }

    const vendorUser = await User.findById(req.user._id).select('vendorDetails');
    console.log('Backend: vendorUser fetched in getVendorPurchaseOrders:', vendorUser);

    if (!vendorUser || !vendorUser.vendorDetails) {
        console.warn('Backend: getVendorPurchaseOrders: Vendor user found, but vendorDetails is missing or null.');
        return res.status(403).json({ message: 'No associated vendor profile found for this user.' });
    }

    const vendorId = vendorUser.vendorDetails;
    console.log('Backend: getVendorPurchaseOrders: Using vendorId:', vendorId);

    const purchaseOrders = await PurchaseOrder.find({ vendor: vendorId })
      .populate('vendor', 'businessName');
      // .select('orderNumber totalAmount deliveryDate issueDate status pdfPath pdfFileName');

    const bills = await Bill.find({ vendor: vendorId })
        .populate('purchaseOrder', 'orderNumber')
        // .select('+pdfPath')
        .lean();

    console.log(`Backend: getVendorPurchaseOrders: Found ${purchaseOrders.length} POs and ${bills.length} Bills.`);
    res.status(200).json({ purchaseOrders, bills });
});


// @desc    Update the status of a Purchase Order
// @route   PUT /api/purchaseorders/:id/status
// @access  Private (Admin only)
const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Purchase Order ID format.' });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase Order not found.' });
    }

    purchaseOrder.status = status;
    const updatedPO = await purchaseOrder.save();
    res.status(200).json({ message: 'Purchase Order status updated successfully.', purchaseOrder: updatedPO });
});


// --- Functions below this line are related to vendor actions and have been updated based on business rule ---

// @desc    Update a Purchase Order by a Vendor
// @route   PUT /api/purchaseorders/:id/vendor-edit
// @access  Private (Vendor)
const updatePurchaseOrderByVendor = asyncHandler(async (req, res) => {
    // This function is disabled based on the new business rule.
    return res.status(403).json({ message: 'Vendors are not allowed to edit Purchase Orders. This is an admin-only action.' });
});

// @desc    Vendor accepts changes made by an Admin
// @route   POST /api/purchaseorders/:id/vendor-accept-admin-changes
// @access  Private (Vendor)
const vendorAcceptAdminChanges = asyncHandler(async (req, res) => {
    // This function is disabled based on the new business rule.
    return res.status(403).json({ message: 'Vendor-initiated actions are no longer supported. This action is invalid.' });
});

// @desc    Vendor rejects changes made by an Admin
// @route   POST /api/purchaseorders/:id/vendor-reject-admin-changes
// @access  Private (Vendor)
const vendorRejectAdminChanges = asyncHandler(async (req, res) => {
    // This function is disabled based on the new business rule.
    return res.status(403).json({ message: 'Vendor-initiated actions are no longer supported. This action is invalid.' });
});

// @desc    Admin approves vendor-edited PO
// @route   POST /api/purchaseorders/:id/approve-vendor-edit
// @access  Private (Admin)
const approveVendorEditedPO = asyncHandler(async (req, res) => {
    // This function is disabled based on the new business rule.
    return res.status(403).json({ message: 'Vendor-initiated actions are no longer supported. This action is invalid.' });
});

// @desc    Admin rejects vendor-edited PO
// @route   POST /api/purchaseorders/:id/reject-vendor-edit
// @access  Private (Admin)
const rejectVendorEditedPO = asyncHandler(async (req, res) => {
    // This function is disabled based on the new business rule.
    return res.status(403).json({ message: 'Vendor-initiated actions are no longer supported. This action is invalid.' });
});


// NEW: Controller for cancelling (soft deleting) a Purchase Order
// @desc    Cancel a Purchase Order (soft delete by setting status to 'cancelled')
// @route   PUT /api/purchaseorders/:id/cancel
// @access  Private (Admin)
const cancelPurchaseOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Purchase Order ID format.' });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase Order not found.' });
    }

    // Prevent cancelling if already in a final state like approved, billed, completed, rejected
    const finalStates = ['approved', 'rejected', 'completed', 'billed'];
    if (finalStates.includes(purchaseOrder.status)) {
        return res.status(400).json({ message: `Cannot cancel a PO with status '${purchaseOrder.status}'.` });
    }

    purchaseOrder.status = 'cancelled';
    const updatedPO = await purchaseOrder.save();

    // Optionally, notify vendor or relevant parties about cancellation
    if (updatedPO.vendor) {
        const vendorUser = await User.findOne({ vendorDetails: updatedPO.vendor });
        if (vendorUser) {
            await Notification.create({
                recipient: vendorUser._id,
                message: `Purchase Order #${updatedPO.orderNumber} has been cancelled by the admin.`,
                type: 'PO_CANCELLED', // You might want to add this to Notification model enum
                relatedId: updatedPO._id,
                relatedModel: 'PurchaseOrder',
                isRead: false,
            });
        }
    }

    res.status(200).json({ message: 'Purchase Order cancelled successfully.', purchaseOrder: updatedPO });
});


// NEW: Controller for getting all cancelled Purchase Orders
// @desc    Get all cancelled Purchase Orders (for Admin)
// @route   GET /api/purchaseorders/cancelled
// @access  Private (Admin)
const getCancelledPurchaseOrders = asyncHandler(async (req, res) => {
    const purchaseOrders = await PurchaseOrder.find({ status: 'cancelled' }).populate('vendor', 'businessName');
    res.status(200).json(purchaseOrders);
});


// NEW: Controller for restoring a cancelled Purchase Order
// @desc    Restore a cancelled Purchase Order (change status back to 'pending')
// @route   PUT /api/purchaseorders/:id/restore
// @access  Private (Admin)
const restorePurchaseOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Purchase Order ID format.' });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase Order not found.' });
    }

    if (purchaseOrder.status !== 'cancelled') {
        return res.status(400).json({ message: 'Only cancelled Purchase Orders can be restored.' });
    }

    purchaseOrder.status = 'pending'; // Restore to pending status
    const updatedPO = await purchaseOrder.save();

    // Optionally, notify vendor or relevant parties about restoration
    if (updatedPO.vendor) {
        const vendorUser = await User.findOne({ vendorDetails: updatedPO.vendor });
        if (vendorUser) {
            await Notification.create({
                recipient: vendorUser._id,
                message: `Purchase Order #${updatedPO.orderNumber} has been restored by the admin.`,
                type: 'PO_RESTORED', // You might want to add this to Notification model enum
                relatedId: updatedPO._id,
                relatedModel: 'PurchaseOrder',
                isRead: false,
            });
        }
    }

    res.status(200).json({ message: 'Purchase Order restored successfully.', purchaseOrder: updatedPO });
});


// NEW: Controller for permanently deleting a Purchase Order
// @desc    Permanently delete a Purchase Order from the database
// @route   DELETE /api/purchaseorders/:id/permanent-delete
// @access  Private (Admin) - Use with extreme caution
const permanentlyDeletePurchaseOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Purchase Order ID format.' });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase Order not found.' });
    }

    // Optional: Add a check here if you only want to allow permanent deletion of 'cancelled' POs
    if (purchaseOrder.status !== 'cancelled') {
        return res.status(400).json({ message: 'Only cancelled POs can be permanently deleted.' });
    }

    await purchaseOrder.deleteOne(); // Mongoose 6+ uses deleteOne()
    res.status(200).json({ message: 'Purchase Order permanently deleted.' });
});

// @desc    Delete a Purchase Order
// @route   DELETE /api/purchaseorders/:id
// @access  Private (Admin)
const deletePurchaseOrder = asyncHandler(async (req, res) => {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (purchaseOrder) {
        await purchaseOrder.deleteOne();
        res.json({ message: 'Purchase Order removed' });
    } else {
        res.status(404);
        throw new Error('Purchase Order not found');
    }
});


module.exports = {
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
};