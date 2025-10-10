const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Assuming notifications are sent to User accounts
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'PO_CREATED',
            'PO_UPDATED',
            'PO_DELETED', // Keep this for now, even if not directly used by new flow
            'PO_APPROVED',
            'PO_REJECTED',
            'PO_VENDOR_EDITED',
            'PO_ADMIN_UPDATED',
            'BILL_CREATED',
            'BILL_APPROVED',
            'BILL_REJECTED',
            'PO_VENDOR_ACCEPTED_ADMIN_CHANGES',
            'PO_VENDOR_REJECTED_ADMIN_CHANGES',
            'PO_CANCELLED', // NEW: For when a PO is cancelled
            'PO_RESTORED', // NEW: For when a PO is restored from cancelled
            'BILL_ADMIN_UPDATED'
        ]
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel',
        required: false
    },
    relatedModel: {
        type: String,
        required: false,
        enum: ['PurchaseOrder', 'Bill', 'Vendor', 'User']
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
