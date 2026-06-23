const Gallery = require('../models/Gallery');
const { uploadToS3, deleteFromS3, getPresignedUrl } = require('../services/uploadService');

// @desc    Get all gallery items with pagination
// @route   GET /api/gallery
// @access  Public
exports.getGalleryItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const total = await Gallery.countDocuments();

        const items = await Gallery.find()
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        // Map over items to get presigned URLs
        const itemsWithPresignedUrls = await Promise.all(
            items.map(async (item) => {
                const itemObj = item.toObject();
                if (itemObj.imageUrl) {
                    itemObj.imageUrl = await getPresignedUrl(itemObj.imageUrl);
                }
                return itemObj;
            })
        );
        
        res.status(200).json({
            success: true,
            count: itemsWithPresignedUrls.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: itemsWithPresignedUrls
        });
    } catch (error) {
        console.error('Error fetching gallery items:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Upload new gallery item
// @route   POST /api/gallery
// @access  Private/Admin
exports.addGalleryItem = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        const description = req.body.description || '';

        // Upload to S3
        const imageUrl = await uploadToS3(
            req.file.buffer,
            req.file.originalname,
            'gallery_photos',
            'gallery'
        );

        // Save to DB
        const galleryItem = await Gallery.create({
            imageUrl,
            description
        });

        const galleryItemObj = galleryItem.toObject();
        galleryItemObj.imageUrl = await getPresignedUrl(galleryItemObj.imageUrl);

        res.status(201).json({
            success: true,
            data: galleryItemObj
        });
    } catch (error) {
        console.error('Error adding gallery item:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteGalleryItem = async (req, res) => {
    try {
        const item = await Gallery.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Gallery item not found' });
        }

        // Delete from S3
        if (item.imageUrl) {
            await deleteFromS3(item.imageUrl);
        }

        // Delete from DB
        await item.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
