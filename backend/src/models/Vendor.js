const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    user: { // Link to the User who is registering as a vendor
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // A user can only register as a vendor once
    },
    businessName: {
        type: String,
        required: true,
        unique: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true,
        unique: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'India' }
    },
    servicesOffered: { // Array of strings, e.g., ['Catering', 'Decorations']
        type: [String],
        required: true
    },
    status: { // For admin approval
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    approvedBy: { // Admin user who approved the vendor
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Not required until approved
    },
    approvalDate: {
        type: Date,
        required: false // Not required until approved
    },
    bankDetails: {
        accountHolderName: { type: String, required: false }, 
        accountNumber: { type: String, required: false },    
        ifscCode: { type: String, required: false },         
        bankName: { type: String, required: false },         
        branch: { type: String, required: false }            
    },
    signedOnboardingPdf: {
        fileName: { type: String },
        fileKey: { type: String },
        fileType: { type: String },
    },
    documents: [
        {
            fileName: { type: String },
            fileKey: { type: String },
            fileType: { type: String },
        },
    ],
    digitalSignature: {
        type: String,
        required: false, // It can be optional
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

/**
 * @swagger
 * components:
 *   schemas:
 *     VendorRegistration:
 *       type: object
 *       properties:
 *         businessName:
 *           type: string
 *           description: The name of the vendor's business.
 *         contactPerson:
 *           type: string
 *           description: The name of the contact person.
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: The email address of the contact person.
 *         contactPhone:
 *           type: string
 *           description: The phone number of the contact person.
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               description: The street address.
 *             city:
 *               type: string
 *               description: The city.
 *             state:
 *               type: string
 *               description: The state.
 *             zipCode:
 *               type: string
 *               description: The zip code.
 *         bankDetails:
 *           type: object
 *           properties:
 *             accountHolderName:
 *               type: string
 *               description: The name of the account holder.
 *             accountNumber:
 *               type: string
 *               description: The bank account number.
 *             ifscCode:
 *               type: string
 *               description: The IFSC code of the bank.
 *             bankName:
 *               type: string
 *               description: The name of the bank.
 *             branch:
 *               type: string
 *               description: The branch of the bank.
 *         servicesOffered:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of services offered by the vendor.
 *     VendorUpdate:
 *       type: object
 *       properties:
 *         businessName:
 *           type: string
 *           description: The name of the vendor's business.
 *         contactPerson:
 *           type: string
 *           description: The name of the contact person.
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: The email address of the contact person.
 *         contactPhone:
 *           type: string
 *           description: The phone number of the contact person.
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               description: The street address.
 *             city:
 *               type: string
 *               description: The city.
 *             state:
 *               type: string
 *               description: The state.
 *             zipCode:
 *               type: string
 *               description: The zip code.
 *         bankDetails:
 *           type: object
 *           properties:
 *             accountHolderName:
 *               type: string
 *               description: The name of the account holder.
 *             accountNumber:
 *               type: string
 *               description: The bank account number.
 *             ifscCode:
 *               type: string
 *               description: The IFSC code of the bank.
 *             bankName:
 *               type: string
 *               description: The name of the bank.
 *             branch:
 *               type: string
 *               description: The branch of the bank.
 *         servicesOffered:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of services offered by the vendor.
 *     VendorLogin:
 *       type: object
 *       properties:
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: The email address of the vendor.
 *         password:
 *           type: string
 *           description: The password of the vendor.
 */
module.exports = mongoose.model('Vendor', VendorSchema);
