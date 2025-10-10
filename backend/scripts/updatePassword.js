const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const updatePassword = async () => {
    try {
        await mongoose.connect('mongodb://root:Vendor%40Way2class%4039@fw0kww0k40cso84c8oo0k40o:27017/?directConnection=true', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const user = await User.findOne({ email: 'dpadmin@example.com' });

        if (!user) {
            console.log('User not found');
            return;
        }

        const password = 'dp12345';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.name = user.name; // Keep the original name
        user.email = user.email; // Keep the original email
        user.password = hashedPassword; // Update the password
        user.role = user.role; // Keep the original role

        await user.save({ validateBeforeSave: false });

        console.log('Password updated successfully');
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        mongoose.disconnect();
    }
};

updatePassword();