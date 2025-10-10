// backend/src/routes/notificationRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for the logged-in user
 *     description: Retrieve notifications for the logged-in user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Returns a list of notifications.
 *       401:
 *         description: Unauthorized.
 */
router.get('/', protect, asyncHandler(async (req, res) => {
    // Find notifications where the recipient is the logged-in user's ID
    const notifications = await Notification.find({ recipient: req.user.id })
                                            .sort({ createdAt: -1 }) // Sort by newest first
                                            .limit(20); // Limit to recent notifications

    res.status(200).json(notifications);
}));

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     description: Mark a notification as read.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the notification to mark as read.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Notification marked as read.
 *       400:
 *         description: Invalid Notification ID format.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Not authorized to update this notification.
 *       404:
 *         description: Notification not found.
 */
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Notification ID format.' });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found.' });
    }

    // Ensure the logged-in user is the recipient of this notification
    if (String(notification.recipient) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to update this notification.' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notification });
}));

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Delete a notification.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the notification to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Notification removed.
 *       400:
 *         description: Invalid Notification ID format.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Not authorized to delete this notification.
 *       404:
 *         description: Notification not found.
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Notification ID format.' });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found.' });
    }

    // Ensure the logged-in user is the recipient of this notification
    if (String(notification.recipient) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to delete this notification.' });
    }

    await notification.deleteOne();

    res.status(200).json({ message: 'Notification removed' });
}));

module.exports = router;
