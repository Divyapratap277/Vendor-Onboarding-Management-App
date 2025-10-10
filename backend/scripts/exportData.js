const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import all models
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');

const exportData = async () => {
    try {
        // Connect to local MongoDB
        await mongoose.connect('mongodb://root:Vendor%40Way2class%4039@95.217.147.77:7890/?directConnection=true');
        console.log('Connected to local MongoDB');

        // Create backup directory
        const backupDir = path.join(__dirname, '../mongodb_backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Export Users
        const users = await User.find({});
        fs.writeFileSync(
            path.join(backupDir, 'users.json'), 
            JSON.stringify(users, null, 2)
        );
        console.log(`Exported ${users.length} users`);

        // Export Notifications
        const notifications = await Notification.find({});
        fs.writeFileSync(
            path.join(backupDir, 'notifications.json'), 
            JSON.stringify(notifications, null, 2)
        );
        console.log(`Exported ${notifications.length} notifications`);

        // Get all collection names to find other collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:');
        collections.forEach(col => console.log('- ' + col.name));

        // Export each collection
        for (const col of collections) {
            if (!['users', 'notifications'].includes(col.name)) {
                const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
                fs.writeFileSync(
                    path.join(backupDir, `${col.name}.json`), 
                    JSON.stringify(data, null, 2)
                );
                console.log(`Exported ${data.length} documents from ${col.name}`);
            }
        }

        console.log('Export completed successfully!');
        
    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        mongoose.disconnect();
    }
};

exportData();