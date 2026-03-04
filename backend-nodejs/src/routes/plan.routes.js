const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
    getActivePlans,
    getAllPlans,
    createPlan,
    updatePlan
} = require('../controllers/planController');

// Public route to fetch active plans
router.get('/active', getActivePlans);

// Admin routes - these will be prefixed with /api/plans/admin in app.js if we wanted, 
// but currently in app.js we simply mount planRoutes at /api/plans.
// So we use '/admin' for the endpoints here, but we MUST NOT duplicate it in the methods.
router.use('/admin', authenticate, isAdmin);
router.get('/admin', getAllPlans);
router.post('/admin', createPlan);
router.put('/admin/:id', updatePlan);

module.exports = router;
