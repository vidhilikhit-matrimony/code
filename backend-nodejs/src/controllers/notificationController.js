const { Notification } = require('../models');

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────

/**
 * Create a new notification draft
 * POST /api/notifications
 */
exports.createNotification = async (req, res, next) => {
    try {
        const { message, isActive } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // If this one is set to active upon creation, deactivate all others
        if (isActive) {
            await Notification.updateMany({}, { isActive: false });
        }

        const notification = await Notification.create({
            message: message.trim(),
            isActive: !!isActive,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all notifications
 * GET /api/notifications
 */
exports.getAllNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find()
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a notification
 * PUT /api/notifications/:id
 */
exports.updateNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.message = message.trim();
        await notification.save();

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle a notification's active status.
 * Ensures only ONE notification can be active at a time.
 * PATCH /api/notifications/:id/toggle
 */
exports.toggleNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // If turning it ON, we must turn everything else OFF first
        if (isActive) {
            await Notification.updateMany({ _id: { $ne: id } }, { isActive: false });
        }

        notification.isActive = !!isActive;
        await notification.save();

        res.json({
            success: true,
            message: isActive ? 'Notification enabled globally' : 'Notification disabled',
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};


// ─── PUBLIC ENDPOINTS ────────────────────────────────────────────

/**
 * Get the currently active notification, if any.
 * GET /api/notifications/active
 */
exports.getActiveNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({ isActive: true });

        res.json({
            success: true,
            data: notification || null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Disable all notifications
 * PATCH /api/notifications/disable-all
 */
exports.disableAllNotifications = async (req, res, next) => {
    try {
        await Notification.updateMany({}, { isActive: false });
        res.json({
            success: true,
            message: 'All notifications disabled globally'
        });
    } catch (error) {
        next(error);
    }
};
