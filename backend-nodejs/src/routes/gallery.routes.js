const express = require('express');
const { getGalleryItems, addGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { upload } = require('../services/uploadService');

const router = express.Router();

router.route('/')
    .get(getGalleryItems)
    .post(authenticate, isAdmin, upload.single('image'), addGalleryItem);

router.route('/:id')
    .delete(authenticate, isAdmin, deleteGalleryItem);

module.exports = router;
