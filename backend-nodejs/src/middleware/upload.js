const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const config = require('../config/env');

// Configure multer for memory storage (before S3 upload)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Check file type
    if (config.upload.allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${config.upload.allowedFileTypes.join(', ')}`), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize
    }
});

/**
 * Middleware to handle single file upload errors
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size is ${config.upload.maxFileSize / 1024 / 1024}MB`
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

/**
 * Generate unique S3 key for file
 * @param {string} folder - Folder name (e.g., 'profiles', 'payments')
 * @param {string} userId - User ID
 * @param {string} originalName - Original filename
 * @returns {string} - S3 key
 */
const generateS3Key = (folder, userId, originalName) => {
    const extension = path.extname(originalName);
    const filename = `${uuidv4()}${extension}`;
    return `${folder}/${userId}/${filename}`;
};

module.exports = {
    upload,
    handleUploadError,
    generateS3Key
};
