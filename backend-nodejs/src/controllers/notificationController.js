const { GlobalNotification } = require('../models');

/**
 * Get the current active global notification
 * GET /api/notifications/global
 * Public or Authenticated (Doesn't strictly need auth, but we can make it public)
 */
const getActiveGlobalNotification = async (req, res, next) => {
    try {
        const notification = await GlobalNotification.findOne({ isActive: true }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: notification || null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new global notification (Admin only)
 * POST /api/notifications/global
 */
const createGlobalNotification = async (req, res, next) => {
    try {
        const { message, type, targetGender, targetSubscription, targetCommunity, targetProfileStatus } = req.body;
        const adminId = req.user._id;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Deactivate all existing notifications
        await GlobalNotification.updateMany({ isActive: true }, { isActive: false });

        // Create the new active notification
        const notification = await GlobalNotification.create({
            message,
            type: type || 'info',
            targetGender: targetGender || 'All',
            targetSubscription: targetSubscription || 'All',
            targetCommunity: targetCommunity || 'All',
            targetProfileStatus: targetProfileStatus || 'All',
            isActive: true,
            createdBy: adminId
        });

        res.status(201).json({
            success: true,
            message: 'Global notification broadcasted successfully',
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Disable the current active global notification (Admin only)
 * DELETE /api/notifications/global
 */
const disableGlobalNotification = async (req, res, next) => {
    try {
        await GlobalNotification.updateMany({ isActive: true }, { isActive: false });
        
        res.status(200).json({
            success: true,
            message: 'Global notification disabled successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActiveGlobalNotification,
    createGlobalNotification,
    disableGlobalNotification
};
