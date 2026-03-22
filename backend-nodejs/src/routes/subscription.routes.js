const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { upload } = require('../services/uploadService');
const {
    submitPayment,
    getPendingPayments,
    getRecentApprovedPayments,
    verifyPayment,
    getMyPaymentStatus
} = require('../controllers/subscriptionController');

// All routes require authentication
router.use(authenticate);

// POST /api/subscriptions/payment - Submit payment
router.post('/payment', upload.single('screenshot'), submitPayment);

// GET /api/subscriptions/my-status - Check own pending payments
router.get('/my-status', getMyPaymentStatus);

// Admin Routes
// GET /api/subscriptions/admin/pending - Get pending payments
router.get('/admin/pending', isAdmin, getPendingPayments);

// GET /api/subscriptions/admin/recent-approved - Get recent approved payments
router.get('/admin/recent-approved', isAdmin, getRecentApprovedPayments);

// POST /api/subscriptions/admin/verify/:id - Verify payment
router.post('/admin/verify/:id', isAdmin, verifyPayment);

module.exports = router;
