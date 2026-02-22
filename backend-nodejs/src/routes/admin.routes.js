const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
    getDashboardStats,
    getAllUsers,
    toggleUserStatus,
    getAllProfilesAdmin
} = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(authenticate, isAdmin);

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/admin/users — List all users
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id/status — Toggle user active status
router.put('/users/:id/status', toggleUserStatus);

// GET /api/admin/profiles — List all profiles (admin view)
router.get('/profiles', getAllProfilesAdmin);

module.exports = router;
