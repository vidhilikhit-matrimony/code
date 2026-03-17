const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
    getDashboardStats,
    getAllUsers,
    createUserAccount,
    toggleUserStatus,
    deleteUser,
    getAllProfilesAdmin,
    updateSubscriptionUnlocks
} = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(authenticate, isAdmin);

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/admin/users — List all users
router.get('/users', getAllUsers);

// POST /api/admin/users — Create a new user (pre-verified)
router.post('/users', createUserAccount);

// PUT /api/admin/users/:id/status — Toggle user active status
router.put('/users/:id/status', toggleUserStatus);

// DELETE /api/admin/users/:id — Permanently delete a user and associated data
router.delete('/users/:id', deleteUser);

// GET /api/admin/profiles — List all profiles (admin view)
router.get('/profiles', getAllProfilesAdmin);

// PUT /api/admin/subscriptions/:id/unlocks - Update subscription unlocks
router.put('/subscriptions/:id/unlocks', updateSubscriptionUnlocks);

module.exports = router;
