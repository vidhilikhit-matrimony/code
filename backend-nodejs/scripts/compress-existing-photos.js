/**
 * ─── Compress Existing S3 Photos ──────────────────────────────────
 * 
 * One-time migration script to compress all existing profile photos in S3.
 * 
 * What it does:
 *   1. Reads all profiles from MongoDB
 *   2. For each photo: downloads from S3, compresses with sharp, re-uploads 
 *      to the SAME key (overwriting the original)
 *   3. No duplicate files — original is replaced in-place
 * 
 * Usage:
 *   cd backend-nodejs
 *   node scripts/compress-existing-photos.js
 * 
 * IMPORTANT: Run this on the EC2 server where it has fast access to S3.
 *            Backup your S3 bucket before running this script.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const config = require('../src/config/env');

// ─── S3 Client ──────────────────────────────────────────────────────

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
const BUCKET = config.aws?.s3Bucket || 'vidhilikhit-uploads';

// ─── Compression Settings ───────────────────────────────────────────

const COMPRESS_OPTIONS = {
    maxWidth: 800,
    maxHeight: 1000,
    quality: 80
};

// Minimum size threshold — skip photos already smaller than 100KB
const MIN_SIZE_TO_COMPRESS = 100 * 1024; // 100KB

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Extract S3 key from a full S3 URL
 */
const getKeyFromUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.slice(1); // Remove leading '/'
    } catch {
        return url; // Already a key
    }
};

/**
 * Download an object from S3 as a Buffer
 */
const downloadFromS3 = async (key) => {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const response = await s3Client.send(command);
    const chunks = [];
    for await (const chunk of response.Body) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

/**
 * Upload a buffer to S3 (overwrites existing key)
 */
const uploadToS3 = async (key, buffer) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000'
    });
    await s3Client.send(command);
};

/**
 * Compress an image buffer with sharp
 */
const compressImage = async (buffer) => {
    return await sharp(buffer)
        .resize(COMPRESS_OPTIONS.maxWidth, COMPRESS_OPTIONS.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({
            quality: COMPRESS_OPTIONS.quality,
            progressive: true,
            mozjpeg: true
        })
        .toBuffer();
};

// ─── Main Migration ─────────────────────────────────────────────────

const run = async () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  COMPRESS EXISTING S3 PHOTOS — Migration Script');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Bucket: ${BUCKET}`);
    console.log(`Region: ${config.aws?.region || 'ap-south-1'}`);
    console.log(`Max size: ${COMPRESS_OPTIONS.maxWidth}×${COMPRESS_OPTIONS.maxHeight}px`);
    console.log(`Quality: ${COMPRESS_OPTIONS.quality}%`);
    console.log(`Skip threshold: ${(MIN_SIZE_TO_COMPRESS / 1024).toFixed(0)}KB\n`);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Connected to MongoDB\n');

    // Load Profile model
    const Profile = require('../src/models/Profile');

    // Get all profiles with photos
    const profiles = await Profile.find({ 'photos.0': { $exists: true } });
    console.log(`Found ${profiles.length} profiles with photos\n`);

    let totalPhotos = 0;
    let compressed = 0;
    let skipped = 0;
    let failed = 0;
    let totalOriginalBytes = 0;
    let totalCompressedBytes = 0;

    for (const profile of profiles) {
        console.log(`\n────── Profile: ${profile.profileCode} (${profile.firstName}) — ${profile.photos.length} photo(s) ──────`);

        for (const photo of profile.photos) {
            totalPhotos++;
            const key = getKeyFromUrl(photo.url);

            try {
                // 1. Download original
                console.log(`  📥 Downloading: ${key}`);
                const originalBuffer = await downloadFromS3(key);
                const originalSize = originalBuffer.length;
                totalOriginalBytes += originalSize;

                // 2. Skip if already small enough
                if (originalSize < MIN_SIZE_TO_COMPRESS) {
                    console.log(`  ⏭️  Skipped (${(originalSize / 1024).toFixed(1)}KB — already small)`);
                    totalCompressedBytes += originalSize;
                    skipped++;
                    continue;
                }

                // 3. Compress
                const compressedBuffer = await compressImage(originalBuffer);
                const compressedSize = compressedBuffer.length;
                totalCompressedBytes += compressedSize;

                // 4. Skip if compression didn't help much (< 10% smaller)
                if (compressedSize >= originalSize * 0.9) {
                    console.log(`  ⏭️  Skipped (compression only saved ${(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%)`);
                    skipped++;
                    continue;
                }

                // 5. Re-upload (overwrite original — no duplicates!)
                console.log(`  📤 Uploading compressed: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}% saved)`);
                await uploadToS3(key, compressedBuffer);
                compressed++;

                console.log(`  ✅ Done`);

            } catch (error) {
                console.error(`  ❌ Failed: ${error.message}`);
                failed++;
            }
        }
    }

    // ─── Summary ────────────────────────────────────────────────────

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('  MIGRATION COMPLETE — SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Total photos processed:  ${totalPhotos}`);
    console.log(`Successfully compressed: ${compressed}`);
    console.log(`Skipped (already small): ${skipped}`);
    console.log(`Failed:                  ${failed}`);
    console.log(`\nOriginal total size:     ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Compressed total size:   ${(totalCompressedBytes / (1024 * 1024)).toFixed(2)} MB`);
    const savedMB = ((totalOriginalBytes - totalCompressedBytes) / (1024 * 1024)).toFixed(2);
    const savedPct = totalOriginalBytes > 0 ? (((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100).toFixed(1) : 0;
    console.log(`Space saved:             ${savedMB} MB (${savedPct}%)`);
    console.log(`\nEstimated monthly savings: $${(parseFloat(savedMB) * 50 * 0.1093 / 1024).toFixed(2)}/mo`);
    console.log(`  (assumes each photo viewed ~50 times/month at $0.1093/GB)\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
};

run().catch((err) => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
});
