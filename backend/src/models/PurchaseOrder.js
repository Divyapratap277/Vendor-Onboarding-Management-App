const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [
        {
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: [
            'pending',
            'approved',
            'rejected',
            'completed',
            'billed', // NEW STATUS: Indicates a bill has been generated
            'vendor_edited',
            'admin_edited',
            'cancelled'
        ],
        default: 'pending'
    },
    pdfPath: { // Path to the generated PDF relative to the uploads directory
        type: String,
        required: false
    },
    pdfFileName: { // Just the filename for easier access
        type: String,
        required: false
    },
    // NEW: Reference to the Bill generated for this Purchase Order
    billId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
        default: null, // Initially null, populated when bill is created
    }
}, {
    timestamps: true
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
