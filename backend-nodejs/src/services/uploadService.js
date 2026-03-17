const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/env');

// Allowed image types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 5MB

const s3Config = {
    region: config.aws?.region || 'ap-south-1'
};

if (config.aws?.accessKeyId && config.aws?.secretAccessKey) {
    s3Config.credentials = {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    };
}

const s3Client = new S3Client(s3Config);

// Multer storage (memory for S3 upload)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported image type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }
};

// Multer upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
});

/**
 * Upload a file to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} folder - S3 folder/prefix
 * @param {string} prefix - File prefix (e.g. user ID)
 * @returns {string} - Public URL
 */
const uploadToS3 = async (buffer, originalName, folder = 'profile_photos', prefix = '') => {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueName = `${prefix}_${crypto.randomUUID()}${ext}`;
    const key = `${folder}/${uniqueName}`;
    const bucket = config.aws?.s3Bucket || 'vidhilikhit-uploads';

    console.log(`[S3 Upload] Uploading to bucket: ${bucket}, key: ${key}, size: ${buffer.length} bytes`);

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: `image/${ext.slice(1)}`
    });

    await s3Client.send(command);

    const url = `https://${bucket}.s3.${config.aws?.region || 'ap-south-1'}.amazonaws.com/${key}`;
    console.log(`[S3 Upload] Success: ${url}`);
    return url;
};

/**
 * Generate a presigned URL for an S3 object
 * @param {string} url - The S3 URL stored in the database
 * @returns {string} - Presigned URL with temporary access
 */
const getPresignedUrl = async (url) => {
    if (!url) return null;

    try {
        const bucket = config.aws?.s3Bucket || 'vidhilikhit-uploads';

        // Extract the key from the URL
        // URL format: https://bucket.s3.region.amazonaws.com/folder/filename.ext
        const urlObj = new URL(url);
        const key = urlObj.pathname.slice(1); // Remove leading '/'

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 86400 }); // 24 hours
        return signedUrl;
    } catch (error) {
        console.error('[S3 Presign] Failed to generate presigned URL:', error.message);
        return url; // Fallback to original URL
    }
};

/**
 * Delete a file from S3
 * @param {string} url - Full S3 URL
 */
const deleteFromS3 = async (url) => {
    if (!url) return;

    try {
        const bucket = config.aws?.s3Bucket || 'vidhilikhit-uploads';

        // Extract key from URL
        const urlObj = new URL(url);
        const key = urlObj.pathname.slice(1); // Remove leading '/'

        console.log(`[S3 Delete] Deleting key: ${key} from bucket: ${bucket}`);

        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        });

        await s3Client.send(command);
        console.log(`[S3 Delete] Success: ${key}`);
    } catch (error) {
        console.error(`[S3 Delete] Failed to delete ${url}:`, error.message);
        // Don't throw, just log. Soft fail.
    }
};

module.exports = {
    upload,
    uploadToS3,
    getPresignedUrl,
    deleteFromS3
};
