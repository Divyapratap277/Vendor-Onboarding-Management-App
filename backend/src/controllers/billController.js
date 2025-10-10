// backend/src/controllers/billController.js

const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const Bill = require('../models/Bill');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const PurchaseOrder = require('../models/PurchaseOrder');

const generateBillPDF = require('../utils/pdf/generateBillPDF');

// Helper function to check for valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private (Admin only)
const createBill = asyncHandler(async (req, res) => {
    const errors = validation = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { vendor, items, issueDate, dueDate, totalAmount, notes, purchaseOrder } = req.body;

    if (!isValidObjectId(vendor)) {
        return res.status(400).json({ message: 'Invalid Vendor ID format.' });
    }

    const vendorExists = await Vendor.findById(vendor);
    if (!vendorExists) {
        return res.status(404).json({ message: 'Vendor not found.' });
    }

    let poExists = null;
    if (purchaseOrder) {
        if (!isValidObjectId(purchaseOrder)) {
            return res.status(400).json({ message: 'Invalid Purchase Order ID format.' });
        }
        poExists = await PurchaseOrder.findById(purchaseOrder);
        if (!poExists) {
            return res.status(404).json({ message: 'Purchase Order not found.' });
        }
        const existingBillForPO = await Bill.findOne({ purchaseOrder: poExists._id });
        if (existingBillForPO) {
            return res.status(400).json({ message: 'A bill already exists for this Purchase Order. Cannot create another.' });
        }
    }

    // Ensure issueDate and dueDate are valid Date objects
    const finalIssueDate = issueDate ? new Date(issueDate) : new Date();
    // Default dueDate to 30 days from issueDate if not provided or invalid
    const finalDueDate = dueDate ? new Date(dueDate) : new Date(finalIssueDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // Add 30 days in milliseconds

    // Validate if dates are actually valid after conversion
    if (isNaN(finalIssueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid issueDate provided.' });
    }
    if (isNaN(finalDueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid dueDate provided.' });
    }

    const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newBill = new Bill({
        billNumber,
        vendor,
        items,
        issueDate: finalIssueDate,
        dueDate: finalDueDate,
        totalAmount,
        notes,
        purchaseOrder: poExists ? poExists._id : undefined,
        generatedBy: req.user.id,
        status: 'issued',        // Initial bill status, already correctly set
        paymentStatus: 'unpaid', // Initial payment status, already correctly set
    });

    const savedBill = await newBill.save();

    const billDataForPdf = {
        ...savedBill.toObject(),
        vendor: vendorExists.toObject(),
        issueDate: savedBill.issueDate.toISOString(),
        dueDate: savedBill.dueDate.toISOString(),
        items: savedBill.items.map((item) => ({
            ...item.toObject(),
            total: (item.quantity * item.unitPrice).toFixed(2)
        }))
    };

    try {
        const pdfPath = await generateBillPDF(billDataForPdf);
        savedBill.pdfPath = pdfPath;
        savedBill.pdfFileName = pdfPath.split('/').pop();
        await savedBill.save();
        console.log(`Successfully generated and saved PDF for Bill ${savedBill.billNumber}. Path: ${savedBill.pdfPath}`);
    } catch (pdfError) {
        console.error('ERROR during initial Bill PDF generation:', pdfError);
    }

    if (poExists) {
        poExists.billId = savedBill._id;
        poExists.status = 'billed';
        await poExists.save();
    }

    res.status(201).json(savedBill);
});

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private (Admin or Vendor)
const getBills = asyncHandler(async (req, res) => {
    let bills;

    if (req.user.role === 'admin') {
        bills = await Bill.find({})
            .populate('vendor', 'businessName')
            .populate('purchaseOrder', 'orderNumber')
            .select('+pdfPath +pdfFileName');
    } else if (req.user.role === 'vendor') {
        const vendorUser = await User.findById(req.user.id).select('vendorDetails');
        if (!vendorUser || !vendorUser.vendorDetails) {
            return res.status(403).json({ message: 'User is not associated with a vendor account.' });
        }
        bills = await Bill.find({ vendor: vendorUser.vendorDetails })
            .populate('vendor', 'businessName')
            .populate('purchaseOrder', 'orderNumber')
            .select('+pdfPath +pdfFileName');
    } else {
        return res.status(403).json({ message: 'Not authorized to access this resource.' });
    }

    res.status(200).json(bills);
});

// @desc    Get a single bill by ID
// @route   GET /api/bills/:id
// @access  Private (Admin or Vendor)
const getBillById = asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id)
        .populate('vendor', 'businessName contactEmail address')
        .populate('purchaseOrder', 'orderNumber')
        .populate('generatedBy', 'name email')
        .select('+pdfPath +pdfFileName');

    if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
    }

    if (req.user.role === 'admin') {
        return res.status(200).json(bill);
    }

    if (req.user.role === 'vendor') {
        const vendorUser = await User.findById(req.user.id).select('vendorDetails');
        if (!vendorUser || !vendorUser.vendorDetails || bill.vendor._id.toString() !== vendorUser.vendorDetails.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this bill.' });
        }
        return res.status(200).json(bill);
    }

    res.status(403).json({ message: 'Not authorized to access this resource.' });
});

// @desc    Update a bill
// @route   PUT /api/bills/:id
// @access  Private (Admin only)
const updateBill = asyncHandler(async (req, res) => {
    console.log('updateBill: called with id:', req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { vendor, items, issueDate, dueDate, totalAmount, notes, status, paymentStatus, purchaseOrder } = req.body;

    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Bill ID format.' });
    }

    let bill = await Bill.findById(req.params.id);

    if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
    }

    // Store old PO before potential update to manage linking/unlinking
    let oldPurchaseOrder = bill.purchaseOrder; 

    // --- Start of NEW Status Logic Implementation ---
    // Validate incoming status values against their respective enums
    const validBillStatuses = ['draft', 'issued', 'sent', 'overdue', 'cancelled', 'completed'];
    const validPaymentStatuses = ['unpaid', 'partially_paid', 'paid', 'refunded'];

    if (status !== undefined && !validBillStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid Bill Workflow Status provided: ${status}` });
    }
    if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: `Invalid Payment Collection Status provided: ${paymentStatus}` });
    }

    // Determine the actual paymentStatus and billStatus to use for logic
    // Use incoming value if provided, otherwise use current bill's value
    const currentOrNewPaymentStatus = paymentStatus !== undefined ? paymentStatus : bill.paymentStatus;
    const currentOrNewBillStatus = status !== undefined ? status : bill.status;

    let enforcedBillStatus = currentOrNewBillStatus; // This will be the final bill.status
    let enforcedPaymentStatus = currentOrNewPaymentStatus; // This will be the final bill.paymentStatus

    // Rule 1: Payment Status is the Single Source of Financial Truth.
    // Logic to enforce consistency and auto-update billStatus based on paymentStatus changes
    // This logic runs *after* basic enum validation.

    if (paymentStatus !== undefined && paymentStatus !== bill.paymentStatus) {
        // A change in paymentStatus was requested, so enforce rules
        enforcedPaymentStatus = paymentStatus; // Use the explicitly requested new payment status

        if (enforcedPaymentStatus === 'paid') {
            enforcedBillStatus = 'completed';
        } else if (enforcedPaymentStatus === 'partially_paid') {
            // If already completed or cancelled, keep that; otherwise, set to issued/sent
            if (enforcedBillStatus === 'completed' || enforcedBillStatus === 'cancelled' || enforcedBillStatus === 'draft') {
                 // Keep current special state if explicitly set
            } else {
                 enforcedBillStatus = 'issued'; // Default active workflow state for partially paid
            }
        } else if (enforcedPaymentStatus === 'unpaid') {
            const billDueDate = new Date(bill.dueDate);
            const now = new Date();
            // Compare only dates, ignore time for 'overdue' check
            if (billDueDate.setHours(0,0,0,0) < now.setHours(0,0,0,0)) {
                enforcedBillStatus = 'overdue';
            } else {
                // If becomes unpaid and not overdue, set to an active workflow state
                if (enforcedBillStatus === 'completed' || enforcedBillStatus === 'cancelled' || enforcedBillStatus === 'draft') {
                    // Keep current special state if explicitly set
                } else {
                    enforcedBillStatus = 'issued'; // Default active workflow state
                }
            }
        } else if (enforcedPaymentStatus === 'refunded') {
            enforcedBillStatus = 'cancelled'; // Or 'completed', based on policy for refunded bills
        }
    } else {
        // No change to paymentStatus or paymentStatus was not provided in req.body
        // The enforcedPaymentStatus just carries over the bill's existing paymentStatus or the incoming paymentStatus if it was the same
        enforcedPaymentStatus = bill.paymentStatus; // Ensure paymentStatus is correctly set for validation below
    }

    // 2. Validate Manual `billStatus` Updates against enforced `paymentStatus`
    // This runs if a 'status' was explicitly sent in req.body and might contradict
    if (status !== undefined && status !== bill.status) {
        const proposedManualBillStatus = status; // This is the status admin *tried* to set

        if (enforcedPaymentStatus === 'paid' && proposedManualBillStatus !== 'completed') {
            return res.status(400).json({ message: `Bill Workflow Status must be 'completed' when Payment Collection Status is 'paid'.` });
        }
        if (enforcedPaymentStatus === 'partially_paid' && (proposedManualBillStatus === 'completed' || proposedManualBillStatus === 'draft')) {
             return res.status(400).json({ message: `Bill Workflow Status cannot be '${proposedManualBillStatus}' when Payment Collection Status is 'partially_paid'.` });
        }
        if (enforcedPaymentStatus === 'unpaid' && (proposedManualBillStatus === 'completed' || proposedManualBillStatus === 'partially_paid')) {
            return res.status(400).json({ message: `Bill Workflow Status cannot be '${proposedManualBillStatus}' when Payment Collection Status is 'unpaid'.` });
        }
        // Additional check for 'overdue' if manually set
        if (proposedManualBillStatus === 'overdue' && enforcedPaymentStatus === 'paid') {
            return res.status(400).json({ message: `Bill Workflow Status cannot be 'overdue' when Payment Collection Status is 'paid'.` });
        }
        // If it passes all strict validations, then the admin's requested 'status' can override the auto-enforced one
        // unless the auto-enforced one was directly driven by paymentStatus change.
        // For simplicity, we'll let auto-enforced status based on payment take precedence.
        // If no paymentStatus change, and the status update is valid for current paymentStatus, then accept it.
        // This means, if paymentStatus didn't change, but billStatus was provided, and it's a valid administrative state
        // then we allow it unless it contradicts.
        // Example: if current paymentStatus is 'unpaid' and admin changes billStatus from 'issued' to 'sent'.
        
        // Only accept manual status update if it aligns with the logic, otherwise use the enforced status.
        if (validBillStatuses.includes(proposedManualBillStatus)) {
            // Check if the proposed manual status is different from the currently enforced one
            // and if it's not a direct contradiction that should have been caught above.
            // This prioritizes the auto-enforced state from paymentStatus.
            // If the status was not auto-set by a payment status change (i.e. paymentStatus was undefined or same as bill.paymentStatus)
            // AND the proposed status is valid for the current paymentStatus, accept it.
            if (paymentStatus === undefined || paymentStatus === bill.paymentStatus) { // No payment status change requested OR no change happened
                 enforcedBillStatus = proposedManualBillStatus; // Allow admin to change workflow status
            }
        }
    }
    // --- End of NEW Status Logic Implementation ---


    // Apply general updates from req.body
    if (items !== undefined) bill.items = items;
    if (issueDate !== undefined) bill.issueDate = issueDate;
    if (dueDate !== undefined) bill.dueDate = dueDate;
    if (totalAmount !== undefined) bill.totalAmount = totalAmount;
    if (notes !== undefined) bill.notes = notes;
    
    // Apply the determined statuses to the bill object
    bill.status = enforcedBillStatus;
    bill.paymentStatus = enforcedPaymentStatus; // Ensure this is explicitly set from what was determined

    // Validate vendor ID if provided in the body (existing logic)
    if (vendor !== undefined) {
        if (!isValidObjectId(vendor)) {
            return res.status(400).json({ message: 'Invalid Vendor ID format.' });
        }
        const vendorExists = await Vendor.findById(vendor);
        if (!vendorExists) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }
        bill.vendor = vendor;
    }

    // Handle purchaseOrder update separately (existing logic)
    if (purchaseOrder !== undefined) {
        if (purchaseOrder === null) {
            bill.purchaseOrder = undefined;
        } else if (!isValidObjectId(purchaseOrder)) {
            return res.status(400).json({ message: 'Invalid Purchase Order ID format.' });
        } else {
            const newPo = await PurchaseOrder.findById(purchaseOrder);
            if (!newPo) {
                return res.status(404).json({ message: 'New Purchase Order not found.' });
            }
            if (newPo.billId && newPo.billId.toString() !== bill._id.toString()) {
                return res.status(400).json({ message: 'This Purchase Order is already linked to another bill.' });
            }
            bill.purchaseOrder = newPo._id;
        }
    }

    const updatedBill = await bill.save(); // Mongoose will run schema validators here

    // Update old PO if it was unlinked (existing logic)
    if (oldPurchaseOrder && oldPurchaseOrder.toString() !== updatedBill.purchaseOrder?.toString()) {
        const poToUnlink = await PurchaseOrder.findById(oldPurchaseOrder);
        if (poToUnlink && poToUnlink.billId && poToUnlink.billId.toString() === bill._id.toString()) {
            poToUnlink.billId = undefined;
            poToUnlink.status = 'created';
            await poToUnlink.save();
        }
    }

    // Update new PO if it was linked (existing logic)
    if (updatedBill.purchaseOrder && updatedBill.purchaseOrder.toString() !== oldPurchaseOrder?.toString()) {
        const poToLink = await PurchaseOrder.findById(updatedBill.purchaseOrder);
        if (poToLink) {
            poToLink.billId = updatedBill._id;
            poToLink.status = 'billed';
            await poToLink.save();
        }
    }

    console.log('updateBill: about to generate PDF for bill:', updatedBill.billNumber);
    try {
        const billDataForPdf = {
            ...updatedBill.toObject(),
            vendor: (await Vendor.findById(updatedBill.vendor)).toObject(),
            purchaseOrder: updatedBill.purchaseOrder ? (await PurchaseOrder.findById(updatedBill.purchaseOrder)).toObject() : undefined,
            issueDate: updatedBill.issueDate.toISOString(),
            dueDate: updatedBill.dueDate.toISOString(),
            items: updatedBill.items.map((item) => ({
                ...item.toObject(),
                total: (item.quantity * item.unitPrice).toFixed(2)
            }))
        };
        const pdfPath = await generateBillPDF(billDataForPdf);
        updatedBill.pdfPath = pdfPath;
        updatedBill.pdfFileName = pdfPath.split('/').pop();
        await updatedBill.save();
        console.log(`Successfully regenerated and saved PDF for Bill ${updatedBill.billNumber}. Path: ${updatedBill.pdfPath}`);
    } catch (pdfError) {
        console.error('ERROR during Bill PDF regeneration within updateBill:', pdfError);
    }
    res.status(200).json(updatedBill);

    // Send notification to vendor (existing logic)
    try {
        const vendorUser = await User.findOne({ vendorDetails: updatedBill.vendor });

        if (vendorUser) {
            const notification = {
                recipient: vendorUser._id,
                message: `Bill ${updatedBill.billNumber} has been updated by the admin. Payment Status: ${updatedBill.paymentStatus}.`,
                type: 'BILL_ADMIN_UPDATED',
                relatedId: updatedBill._id,
                relatedModel: 'Bill'
            };

            console.log('Notification object:', notification);

            const newNotification = new (require('../models/Notification'))(notification);
            console.log('New notification:', newNotification);
            await newNotification.save();

            console.log(`Notification sent to vendor ${vendorUser.email} for updated bill ${updatedBill.billNumber}`);
        } else {
            console.log(`No vendor user found for vendor ${updatedBill.vendor}`);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
});

// @desc    Delete a bill
// @route   DELETE /api/bills/:id
// @access  Private (Admin only)
const deleteBill = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Bill ID format.' });
    }

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.purchaseOrder) {
        const linkedPo = await PurchaseOrder.findById(bill.purchaseOrder);
        if (linkedPo && linkedPo.billId && linkedPo.billId.toString() === bill._id.toString()) {
            linkedPo.billId = undefined;
            await linkedPo.save();
        }
    }

    if (bill.pdfPath) {
        const absolutePdfPath = path.join(__dirname, '..', '..', 'uploads', bill.pdfPath);
        try {
            await fs.unlink(absolutePdfPath);
            console.log(`Deleted PDF file: ${absolutePdfPath}`);
        } catch (fileError) {
            console.error(`Failed to delete PDF file ${absolutePdfPath}:`, fileError);
        }
    }

    await bill.deleteOne();
    res.status(200).json({ message: 'Bill removed' });
});

// @desc    Generate/Regenerate PDF for an existing Bill
// @route   PUT /api/bills/:id/generate-pdf
// @access  Private (Admin only)
const generateBillPdfForExistingBill = asyncHandler(async (req, res) => {
    console.log('generateBillPdfForExistingBill: called with id:', req.params.id);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid Bill ID format.' });
    }

    let bill = await Bill.findById(id)
        .populate('vendor', 'businessName contactEmail address')
        .populate('purchaseOrder', 'orderNumber')
        .populate('generatedBy', 'name email');

    if (!bill) {
        return res.status(404).json({ message: 'Bill not found.' });
    }

    // Ensure issueDate and dueDate are valid Date objects for PDF generation
    const finalIssueDate = new Date(bill.issueDate);
    // --- FIX: Ensure bill.dueDate is set if it's missing on the fetched document ---
    if (!bill.dueDate || isNaN(new Date(bill.dueDate).getTime())) {
        bill.dueDate = new Date(finalIssueDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // Default to 30 days from issueDate
        console.warn(`Bill ${bill.billNumber} had missing/invalid dueDate. Defaulted to ${bill.dueDate.toISOString()}`);
    }
    const finalDueDate = new Date(bill.dueDate); // Use the potentially updated bill.dueDate

    // Validate if dates are actually valid after conversion (should pass now with fallback)
    if (isNaN(finalIssueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid issueDate on bill record.' });
    }
    if (isNaN(finalDueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid dueDate on bill record.' });
    }

    const billDataForPdf = {
        ...bill.toObject(),
        vendor: bill.vendor.toObject(),
        purchaseOrder: bill.purchaseOrder ? bill.purchaseOrder.toObject() : undefined,
        issueDate: finalIssueDate.toISOString(),
        dueDate: finalDueDate.toISOString(),
        items: bill.items.map((item) => ({
            ...item.toObject(),
            total: (item.quantity * item.unitPrice).toFixed(2)
        }))
    };

    try {
        const pdfPath = await generateBillPDF(billDataForPdf);
        bill.pdfPath = pdfPath;
        bill.pdfFileName = pdfPath.split('/').pop();
        await bill.save(); // This save should now pass validation for dueDate

        res.status(200).json({
            success: true,
            message: 'Bill PDF generated successfully.',
            pdfPath: bill.pdfPath,
            pdfFileName: bill.pdfFileName,
        });
    } catch (pdfError) {
        console.error('ERROR during Bill PDF regeneration:', pdfError);
        res.status(500).json({ message: 'Failed to generate Bill PDF.' });
    }
});

// @desc    Download a bill PDF
// @route   GET /api/bills/:id/download
// @access  Private (Admin or Vendor)
const downloadBillPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid Bill ID format.' });
    }

    const bill = await Bill.findById(id).select('+pdfPath +pdfFileName');

    if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
    }

    if (!bill.pdfPath) {
        return res.status(404).json({ message: 'PDF not found for this bill. Try generating the bill again.' });
    }

    // Construct the absolute path to the PDF file
    const absolutePdfPath = path.join(__dirname, '..', '..', 'uploads', bill.pdfPath);

    // Check if the file exists
    fs.access(absolutePdfPath)
        .then(() => {
            // Set appropriate headers for file download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${bill.pdfFileName}"`);

            // Stream the file to the response
            fs.readFile(absolutePdfPath)
                .then(data => {
                    res.send(data);
                })
                .catch(readError => {
                    console.error('Error reading PDF file:', readError);
                    return res.status(500).json({ message: 'Error reading PDF file.' });
                });
        })
        .catch(() => {
            return res.status(404).json({ message: 'PDF file not found on the server.' });
        });
});

module.exports = {
    createBill,
    getBills,
    getBillById,
    updateBill,
    deleteBill,
    downloadBillPDF,
    generateBillPdfForExistingBill,
};