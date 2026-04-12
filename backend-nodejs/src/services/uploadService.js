const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const config = require('../config/env');

// Allowed image types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (was incorrectly 50MB before)

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

// ─── Image Compression ─────────────────────────────────────────────

/**
 * Compress and resize an image buffer using sharp
 * Converts to progressive JPEG for best compression/quality ratio
 * @param {Buffer} buffer - Raw image buffer
 * @param {Object} options - Compression options
 * @returns {Promise<Buffer>} - Compressed image buffer
 */
const compressImage = async (buffer, options = {}) => {
    const {
        maxWidth = 800,
        maxHeight = 1000,
        quality = 80
    } = options;

    try {
        const compressed = await sharp(buffer)
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true  // Don't upscale small images
            })
            .jpeg({
                quality,
                progressive: true,  // Progressive JPEG loads faster
                mozjpeg: true       // Use mozjpeg for better compression
            })
            .toBuffer();

        const originalKB = (buffer.length / 1024).toFixed(1);
        const compressedKB = (compressed.length / 1024).toFixed(1);
        const savings = (((buffer.length - compressed.length) / buffer.length) * 100).toFixed(1);
        console.log(`[Sharp] Compressed: ${originalKB}KB → ${compressedKB}KB (${savings}% smaller)`);

        return compressed;
    } catch (error) {
        console.error('[Sharp] Compression failed, using original:', error.message);
        return buffer; // Fallback to original if sharp fails
    }
};

// ─── S3 Upload ──────────────────────────────────────────────────────

/**
 * Upload a file to S3 (with automatic compression for images)
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} folder - S3 folder/prefix
 * @param {string} prefix - File prefix (e.g. user ID)
 * @returns {string} - Public URL
 */
const uploadToS3 = async (buffer, originalName, folder = 'profile_photos', prefix = '') => {
    // Compress the image before uploading
    const compressedBuffer = await compressImage(buffer);

    // Always save as .jpg since sharp converts to JPEG
    const uniqueName = `${prefix}_${crypto.randomUUID()}.jpg`;
    const key = `${folder}/${uniqueName}`;
    const bucket = config.aws?.s3Bucket || 'vidhilikhit-uploads';

    console.log(`[S3 Upload] Uploading to bucket: ${bucket}, key: ${key}, size: ${compressedBuffer.length} bytes`);

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: compressedBuffer,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000'  // 1 year cache (content-addressed)
    });

    await s3Client.send(command);

    const url = `https://${bucket}.s3.${config.aws?.region || 'ap-south-1'}.amazonaws.com/${key}`;
    console.log(`[S3 Upload] Success: ${url}`);
    return url;
};

// ─── Presigned URL Cache ────────────────────────────────────────────

/**
 * In-memory cache for presigned URLs.
 * Avoids regenerating presigned URLs on every API call.
 * Cache TTL = 12 hours (presigned URLs valid for 24 hours).
 */
const presignedUrlCache = new Map();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_CACHE_SIZE = 2000;

/**
 * Periodically clean up expired cache entries
 */
const cleanupCache = () => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, val] of presignedUrlCache) {
        if (now - val.timestamp > CACHE_TTL_MS) {
            presignedUrlCache.delete(key);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log(`[Presigned Cache] Cleaned ${cleaned} expired entries. Size: ${presignedUrlCache.size}`);
    }
};

// Run cleanup every 30 minutes
setInterval(cleanupCache, 30 * 60 * 1000);

/**
 * Generate a presigned URL for an S3 object (with caching)
 * @param {string} url - The S3 URL stored in the database
 * @returns {string} - Presigned URL with temporary access
 */
const getPresignedUrl = async (url) => {
    if (!url) return null;

    try {
        // Check cache first
        const cached = presignedUrlCache.get(url);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
            return cached.signedUrl;
        }

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

        // Store in cache
        presignedUrlCache.set(url, { signedUrl, timestamp: Date.now() });

        // Evict oldest entries if cache is too large
        if (presignedUrlCache.size > MAX_CACHE_SIZE) {
            cleanupCache();
        }

        return signedUrl;
    } catch (error) {
        console.error('[S3 Presign] Failed to generate presigned URL:', error.message);
        return url; // Fallback to original URL
    }
};

// ─── S3 Delete ──────────────────────────────────────────────────────

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

        // Also remove from presigned URL cache
        presignedUrlCache.delete(url);

        console.log(`[S3 Delete] Success: ${key}`);
    } catch (error) {
        console.error(`[S3 Delete] Failed to delete ${url}:`, error.message);
        // Don't throw, just log. Soft fail.
    }
};

module.exports = {
    upload,
    uploadToS3,
    compressImage,
    getPresignedUrl,
    deleteFromS3,
    s3Client
};
