const config = require('../config/env');

/**
 * Admin authorization middleware
 * Must be used after authenticate middleware
 */
const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user is admin
        const adminEmails = [config.admin.email, 'admin@vidhilikhit.com', 'admin@example.com'];
        const adminUsernames = [config.admin.username, 'admin', 'vasudev'];

        const isAdminUser =
            adminUsernames.includes(req.user.username.toLowerCase()) ||
            adminEmails.includes(req.user.email.toLowerCase());

        if (!isAdminUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        req.isAdmin = true;
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking admin status',
            error: error.message
        });
    }
};

/**
 * Check if current user is admin (utility function)
 */
const checkIsAdmin = (user) => {
    const adminEmails = [config.admin.email, 'admin@vidhilikhit.com', 'admin@example.com'];
    const adminUsernames = [config.admin.username, 'admin', 'vasudev'];

    return (
        adminUsernames.includes(user.username.toLowerCase()) ||
        adminEmails.includes(user.email.toLowerCase())
    );
};

module.exports = {
    isAdmin,
    checkIsAdmin
};
