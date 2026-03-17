const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const config = require('./env');

// Initialize S3 Client
const s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    }
});

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} key - S3 object key (path)
 * @param {string} contentType - File MIME type
 * @returns {Promise<string>} - S3 URL
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: config.aws.s3Bucket,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType
            }
        });

        await upload.done();

        // Return public URL
        return `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('Failed to upload file to S3');
    }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 */
const deleteFromS3 = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: config.aws.s3Bucket,
            Key: key
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('S3 Delete Error:', error);
        throw new Error('Failed to delete file from S3');
    }
};

/**
 * Get presigned URL for private S3 objects
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 3600)
 * @returns {Promise<string>} - Presigned URL
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: config.aws.s3Bucket,
            Key: key
        });

        return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
        console.error('S3 Presigned URL Error:', error);
        throw new Error('Failed to generate presigned URL');
    }
};

/**
 * Extract S3 key from URL
 * @param {string} url - S3 URL
 * @returns {string} - S3 key
 */
const getKeyFromUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.substring(1); // Remove leading slash
    } catch (error) {
        return url; // If not a URL, assume it's already a key
    }
};

module.exports = {
    s3Client,
    uploadToS3,
    deleteFromS3,
    getPresignedUrl,
    getKeyFromUrl
};
