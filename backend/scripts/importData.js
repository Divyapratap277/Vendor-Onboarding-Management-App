const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import all models
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');

const importData = async () => {
    try {
        // Connect to Coolify MongoDB
        await mongoose.connect('mongodb://root:Vendor%40Way2class%4039@fw0kww0k40cso84c8oo0k40o:27017/?directConnection=true');
        console.log('Connected to Coolify MongoDB');

        const backupDir = path.join(__dirname, '../mongodb_backup');

        // Check if backup directory exists
        if (!fs.existsSync(backupDir)) {
            console.error('Backup directory not found!');
            return;
        }

        // Import Users
        if (fs.existsSync(path.join(backupDir, 'users.json'))) {
            const users = JSON.parse(fs.readFileSync(path.join(backupDir, 'users.json'), 'utf8'));
            
            // Clear existing users
            await User.deleteMany({});
            
            // Insert users directly (bypass validation to preserve hashed passwords)
            await User.insertMany(users, { ordered: false });
            console.log(`Imported ${users.length} users`);
        }

        // Import Notifications
        if (fs.existsSync(path.join(backupDir, 'notifications.json'))) {
            const notifications = JSON.parse(fs.readFileSync(path.join(backupDir, 'notifications.json'), 'utf8'));
            
            await Notification.deleteMany({});
            if (notifications.length > 0) {
                await Notification.insertMany(notifications, { ordered: false });
            }
            console.log(`Imported ${notifications.length} notifications`);
        }

        // Import other collections
        const files = fs.readdirSync(backupDir);
        for (const file of files) {
            if (file.endsWith('.json') && !['users.json', 'notifications.json'].includes(file)) {
                const collectionName = file.replace('.json', '');
                const data = JSON.parse(fs.readFileSync(path.join(backupDir, file), 'utf8'));
                
                // Clear and import
                await mongoose.connection.db.collection(collectionName).deleteMany({});
                if (data.length > 0) {
                    await mongoose.connection.db.collection(collectionName).insertMany(data);
                }
                console.log(`Imported ${data.length} documents to ${collectionName}`);
            }
        }

        console.log('Import completed successfully!');
        
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        mongoose.disconnect();
    }
};

importData();