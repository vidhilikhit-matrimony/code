require('dotenv').config();
const { Client } = require('pg');
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// MongoDB Models
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');

const pgClient = new Client({
    connectionString: "postgresql://app_user:SimpleStrongPass123@34.47.189.217:5432/vidhilikhit"
});

// Setup S3 Client based on backend-nodejs .env
const s3Config = {
    region: process.env.AWS_REGION || 'ap-south-1'
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
}
const s3Client = new S3Client(s3Config);
const s3Bucket = process.env.AWS_S3_BUCKET || 'matrimony-profile-image';


/**
 * Upload a downloaded buffer to S3
 */
const uploadToS3 = async (buffer, originalUrl, folder = 'profile_photos', prefix = '') => {
    // Extract intended extension from original URL or default to jpg
    let ext = '.jpg';
    try {
        const urlObj = new URL(originalUrl);
        const parsedPath = path.extname(urlObj.pathname);
        if (parsedPath) ext = parsedPath.toLowerCase();
    } catch (e) { }

    // Fallback cleanup of query params if parsing failed
    ext = ext.split('?')[0];

    const uniqueName = `${prefix}_${crypto.randomUUID()}${ext}`;
    const key = `${folder}/${uniqueName}`;

    let contentType = `image/${ext.slice(1)}`;
    if (ext === '.jpg') contentType = 'image/jpeg';

    const command = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
    });

    await s3Client.send(command);
    const s3Region = process.env.AWS_REGION || 'ap-south-1';
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;
};


async function migratePhotos() {
    try {
        console.log('Connecting to PostgreSQL...');
        await pgClient.connect();

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Fetching all users from PostgreSQL (Matching Phase 1)...');
        // Joining to ensure we ONLY get users that have profiles actually migrated in Phase 1
        const usersResult = await pgClient.query('SELECT * FROM users ORDER BY id ASC');
        const oldUsers = usersResult.rows;

        console.log(`Checking ${oldUsers.length} users for photos to migrate...`);

        let migratedPhotosCount = 0;

        for (const oldUser of oldUsers) {

            // Check if user actually exists in Mongo
            const existingUser = await User.findOne({ email: oldUser.email });
            if (!existingUser) {
                console.log(`User ${oldUser.email} not found in Mongo, skipping.`);
                continue;
            }

            // Find their MongoDB profile
            const mongoProfile = await Profile.findOne({ userId: existingUser._id });
            if (!mongoProfile) {
                console.log(`Profile for ${oldUser.email} not found in Mongo, skipping.`);
                continue;
            }

            // Get profile from postgres
            const profileResult = await pgClient.query('SELECT * FROM profiles WHERE user_id = $1', [oldUser.id]);
            const oldProfile = profileResult.rows[0];
            if (!oldProfile) continue;

            // Fetch old profile_photos from postgres
            const photosResult = await pgClient.query('SELECT * FROM profile_photos WHERE profile_id = $1 ORDER BY is_primary DESC', [oldProfile.id]);
            const oldPhotos = photosResult.rows;

            if (oldPhotos.length === 0) {
                continue; // no photos for this profile
            }

            console.log(`Found ${oldPhotos.length} photos for user ${oldUser.email}. Starting download...`);

            // Clear old photos in mongo to be replaced, if we ran this script multiple times
            // By default we assume we want to rebuild the photos array
            const newPhotosArray = [];

            for (const oldPhoto of oldPhotos) {
                let photoUrl = oldPhoto.photo_url;

                // Normalizing old backward-compatible paths just like the Python backend did
                if (photoUrl && !photoUrl.startsWith('http')) {
                    const cleaned = photoUrl.replace('/home/ubuntu/uploads/', '').replace('uploads/', '');
                    const parts = cleaned.split('/');
                    if (parts.length >= 2) {
                        const folder = parts[0];
                        const filename = parts[1];
                        photoUrl = `https://storage.googleapis.com/vidhilikhit-uploads/${folder}/${filename}`;
                    }
                }

                if (!photoUrl || !photoUrl.startsWith('http')) {
                    console.log(`Invalid photo URL for ${oldUser.email}: ${photoUrl}`);
                    continue;
                }

                try {
                    // Download the image
                    console.log(`  Downloading: ${photoUrl}`);
                    const response = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 10000 });
                    const fileBuffer = Buffer.from(response.data);

                    // Upload to S3
                    const prefixId = existingUser._id.toString().slice(-6); // short prefix
                    const newS3Url = await uploadToS3(fileBuffer, photoUrl, 'profile_photos', prefixId);

                    console.log(`  Successfully uploaded to S3: ${newS3Url}`);

                    newPhotosArray.push({
                        url: newS3Url,
                        isPrimary: oldPhoto.is_primary === true,
                        uploadedAt: oldPhoto.uploaded_at || new Date()
                    });

                    migratedPhotosCount++;

                } catch (downloadErr) {
                    console.error(`  Failed to transfer photo ${photoUrl}: ${downloadErr.message}`);
                }
            }

            if (newPhotosArray.length > 0) {
                // Update Mongo
                mongoProfile.photos = newPhotosArray;
                await mongoProfile.save();
                console.log(`Updated Mongo Profile for ${oldUser.email} with ${newPhotosArray.length} photos.`);
            }
        }

        console.log(`Successfully migrated ${migratedPhotosCount} public photos to S3.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pgClient.end();
        await mongoose.connection.close();
        console.log('Connections closed.');
    }
}

migratePhotos();
