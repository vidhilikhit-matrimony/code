const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');

// Public endpoints
router.get('/active', notificationController.getActiveNotification);

// Admin-only endpoints
router.use(authenticate);
router.use(isAdmin);

router.get('/', notificationController.getAllNotifications);
router.post('/', notificationController.createNotification);
router.patch('/disable-all', notificationController.disableAllNotifications);
router.put('/:id', notificationController.updateNotification);
router.patch('/:id/toggle', notificationController.toggleNotification);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
