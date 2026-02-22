const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../services/uploadService');
const {
    createOrUpdateProfile,
    getMyProfile,
    getAllProfiles,
    getProfileById,
    unlockProfile,
    deleteProfile
} = require('../controllers/profileController');

// GET /api/profiles/me — requires auth (must be before /:id)
router.get('/me', authenticate, getMyProfile);

// GET /api/profiles — public, but optionalAuth so logged-in users exclude their own profile
router.get('/', optionalAuth, getAllProfiles);

// POST /api/profiles — Create or update profile (auth required)
router.post('/', authenticate, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'galleryImages', maxCount: 2 }
]), createOrUpdateProfile);

// GET /api/profiles/:id — public, but optionalAuth for unlock/ownership check
router.get('/:id', optionalAuth, getProfileById);

// POST /api/profiles/:id/unlock — auth required (deducts a view)
router.post('/:id/unlock', authenticate, unlockProfile);

// DELETE /api/profiles/:id — auth required
router.delete('/:id', authenticate, deleteProfile);

const { downloadProfilePdf } = require('../controllers/pdfController');
// GET /api/profiles/:id/pdf — Download PDF (auth required)
router.get('/:id/pdf', authenticate, downloadProfilePdf);

module.exports = router;
