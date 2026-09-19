const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { 
    getActiveGlobalNotification, 
    createGlobalNotification, 
    disableGlobalNotification 
} = require('../controllers/notificationController');

// Get active notification (Public or authenticated, we'll keep it public for ease)
router.get('/global', getActiveGlobalNotification);

// Create new notification (Admin only)
router.post('/global', authenticate, isAdmin, createGlobalNotification);

// Disable active notification (Admin only)
router.delete('/global', authenticate, isAdmin, disableGlobalNotification);

module.exports = router;
