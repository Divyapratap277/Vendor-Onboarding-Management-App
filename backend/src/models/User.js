// VMS_Project/backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// Define the schema for a User document in MongoDB
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Name is a mandatory field
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email must be unique for each user
        lowercase: true, // Store email in lowercase
        trim: true // Remove whitespace from both ends
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Example: Minimum password length
    },
    role: {
        type: String,
        enum: ['admin', 'vendor'], // User can be an admin or a vendor
        default: 'vendor' // Default role for new sign-ups
    },
    // This field will link a User account to a specific Vendor profile (if the user IS a vendor)
    vendorDetails: {
        type: mongoose.Schema.Types.ObjectId, // This is a special Mongoose type for referencing other documents
        ref: 'Vendor', // It refers to documents in the 'Vendor' collection (which we'll create later)
        default: null // Initially, a user might not be linked to a vendor profile
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set creation date
    }
});

// Mongoose middleware to hash the password BEFORE saving the user to the database
// 'pre' means it runs before the 'save' event
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (e.g., on creation or password change)
    if (!this.isModified('password')) {
        return next(); // If password hasn't changed, skip hashing
    }
    // Generate a salt (random string) to add to the password before hashing
    const salt = await bcrypt.genSalt(10); // 10 is the cost factor; higher means more secure but slower
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Continue with the save operation
});

// Method to compare an entered password with the hashed password stored in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // 'bcrypt.compare' securely compares the plain text password with the hashed one
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the Mongoose model from the schema
const User = mongoose.model('User', UserSchema);

module.exports = User; // Export the User model for use in other files