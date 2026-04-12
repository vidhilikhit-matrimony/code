/**
 * ─── Upload Static Assets to S3 ──────────────────────────────────
 * 
 * Compresses hero images, team photos, and logo assets, then uploads
 * them to S3 under the `static/` prefix for serving.
 * 
 * After running this:
 *   1. Update frontend .env with VITE_STATIC_S3_URL
 *   2. Rebuild the frontend
 * 
 * Usage:
 *   cd backend-nodejs
 *   node scripts/upload-static-to-s3.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const config = require('../src/config/env');

// ─── S3 Client ──────────────────────────────────────────────────────

const s3Config = { region: config.aws?.region || 'ap-south-1' };
if (config.aws?.accessKeyId && config.aws?.secretAccessKey) {
    s3Config.credentials = {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    };
}
const s3Client = new S3Client(s3Config);
const BUCKET = config.aws?.s3Bucket || 'vidhilikhit-uploads';
const REGION = config.aws?.region || 'ap-south-1';

// ─── Directories to Process ─────────────────────────────────────────

const FRONTEND_ROOT = path.join(__dirname, '..', '..', 'frontend-react');

const ASSET_DIRS = [
    {
        localDir: path.join(FRONTEND_ROOT, 'public', 'assets', 'hero'),
        s3Prefix: 'static/hero',
        description: 'Hero background images'
    },
    {
        localDir: path.join(FRONTEND_ROOT, 'public', 'images'),
        s3Prefix: 'static/images',
        description: 'Team/public images'
    },
    {
        localDir: path.join(FRONTEND_ROOT, 'src', 'assets'),
        s3Prefix: 'static/assets',
        description: 'Logo and other assets'
    }
];

// ─── Compression ────────────────────────────────────────────────────

const compressAsset = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const buffer = fs.readFileSync(filePath);

    if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
        return { buffer, contentType: 'application/octet-stream', ext };
    }

    try {
        // Compress to WebP for much better compression
        const webpBuffer = await sharp(buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // Also compress to JPEG as fallback
        const jpegBuffer = await sharp(buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, progressive: true, mozjpeg: true })
            .toBuffer();

        // Use the smaller of webp / jpeg
        if (webpBuffer.length < jpegBuffer.length) {
            return { buffer: webpBuffer, contentType: 'image/webp', ext: '.webp' };
        } else {
            return { buffer: jpegBuffer, contentType: 'image/jpeg', ext: '.jpg' };
        }
    } catch (err) {
        console.error(`  ⚠️  Compression failed for ${filePath}: ${err.message}`);
        const ct = ext === '.png' ? 'image/png' : 'image/jpeg';
        return { buffer, contentType: ct, ext };
    }
};

// ─── Upload ─────────────────────────────────────────────────────────

const uploadFile = async (key, buffer, contentType) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable'
    });
    await s3Client.send(command);
};

// ─── Main ─────────────────────────────────────────────────────────────

const run = async () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  UPLOAD STATIC ASSETS TO S3');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Bucket: ${BUCKET}`);
    console.log(`Region: ${REGION}\n`);

    const uploadedFiles = {};
    let totalOriginal = 0;
    let totalCompressed = 0;

    for (const assetDir of ASSET_DIRS) {
        console.log(`\n────── ${assetDir.description} ──────`);
        console.log(`  Source: ${assetDir.localDir}`);
        console.log(`  Target: s3://${BUCKET}/${assetDir.s3Prefix}/\n`);

        if (!fs.existsSync(assetDir.localDir)) {
            console.log(`  ⚠️  Directory not found, skipping.`);
            continue;
        }

        const files = fs.readdirSync(assetDir.localDir)
            .filter(f => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase()));

        for (const file of files) {
            const filePath = path.join(assetDir.localDir, file);
            const originalSize = fs.statSync(filePath).size;
            totalOriginal += originalSize;

            // Compress
            const { buffer, contentType, ext } = await compressAsset(filePath);
            totalCompressed += buffer.length;

            // Upload with compressed extension
            const baseName = path.basename(file, path.extname(file));
            const s3Key = `${assetDir.s3Prefix}/${baseName}${ext}`;

            console.log(`  📤 ${file} (${(originalSize / 1024).toFixed(0)}KB) → ${baseName}${ext} (${(buffer.length / 1024).toFixed(0)}KB)`);

            await uploadFile(s3Key, buffer, contentType);

            // Map original filename to S3 URL
            const s3Url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`;
            uploadedFiles[file] = {
                s3Key,
                s3Url,
                originalSize,
                compressedSize: buffer.length
            };
        }
    }

    // ─── Summary ────────────────────────────────────────────────────

    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('  UPLOAD COMPLETE — SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Files uploaded: ${Object.keys(uploadedFiles).length}`);
    console.log(`Original total: ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Compressed total: ${(totalCompressed / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Savings: ${((totalOriginal - totalCompressed) / (1024 * 1024)).toFixed(2)} MB (${(((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1)}%)\n`);

    // Output the mapping for updating frontend code
    console.log('─── S3 URL Mapping (for frontend updates) ───\n');
    console.log(`S3 Base URL: https://${BUCKET}.s3.${REGION}.amazonaws.com/static/\n`);

    // Save mapping to JSON file for reference
    const mappingPath = path.join(__dirname, 'static-assets-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(uploadedFiles, null, 2));
    console.log(`Mapping saved to: ${mappingPath}\n`);

    // Show hero image URLs specifically for Home.jsx
    console.log('─── Hero Image S3 Keys (for Home.jsx) ───\n');
    for (const [original, info] of Object.entries(uploadedFiles)) {
        if (info.s3Key.startsWith('static/hero/')) {
            console.log(`  '${original}' → '${info.s3Key}'`);
        }
    }

    console.log('\n\n✅ Done! Now update your frontend to use these S3 URLs.');
    console.log('   Add to frontend .env: VITE_STATIC_S3_URL=https://' + BUCKET + '.s3.' + REGION + '.amazonaws.com/static');
    console.log('   Then rebuild: cd frontend-react && npm run build\n');

    process.exit(0);
};

run().catch(err => {
    console.error('\n❌ Upload failed:', err);
    process.exit(1);
});
