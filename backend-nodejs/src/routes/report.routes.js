const express = require('express');
const router = express.Router();
const { downloadPublicProfilesPdf, downloadAdminProfilesPdf } = require('../controllers/pdfController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/reports/profiles/public?community=brahmin&gender=male
 * Public endpoint - no authentication required
 */
router.get('/profiles/public', downloadPublicProfilesPdf);

/**
 * GET /api/reports/profiles/admin?community=all&gender=all
 * Admin only - includes phone number and postal address
 */
router.get('/profiles/admin', authenticate, isAdmin, downloadAdminProfilesPdf);

module.exports = router;
