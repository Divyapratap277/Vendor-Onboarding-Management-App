const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        required: true,
        unique: true,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
        required: false, // Bill might exist without a direct PO link initially, or be created from other sources
    },
    items: [
        {
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    issueDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    // --- UPDATED: Redefined Bill Workflow Status enum ---
    status: {
        type: String,
        required: true,
        // Removed 'paid', 'partially_paid', 'unpaid' from here as they belong to paymentStatus.
        // 'overdue' remains as it's a workflow state derived from financial status and date.
        // 'completed' is added to signify a bill that has finished its administrative lifecycle.
        enum: ['draft', 'issued', 'sent', 'overdue', 'cancelled', 'completed'],
        default: 'draft', // A new bill could start as 'draft' or 'issued'
    },
    paymentStatus: { // Separate field for payment status, remains as is
        type: String,
        required: true,
        enum: ['unpaid', 'partially_paid', 'paid', 'refunded'],
        default: 'unpaid',
    },
    notes: {
        type: String,
        required: false,
    },
    pdfPath: {
        type: String,
        required: false,
    },
    pdfFileName: {
        type: String,
        required: false,
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you link to your User model
        required: true, // Make it required as per the error
    },
}, {
    timestamps: true,
});


const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;