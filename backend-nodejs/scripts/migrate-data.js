require('dotenv').config();
const { Client } = require('pg');
const mongoose = require('mongoose');

// MongoDB Models
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');

const pgClient = new Client({
    connectionString: "postgresql://app_user:SimpleStrongPass123@34.47.189.217:5432/vidhilikhit"
});

async function migrateData() {
    try {
        console.log('Connecting to PostgreSQL...');
        await pgClient.connect();

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Fetching all users from PostgreSQL...');
        const usersResult = await pgClient.query('SELECT * FROM users ORDER BY id ASC');
        const oldUsers = usersResult.rows;

        try {
            await mongoose.connection.collection('users').dropIndex('username_1');
            console.log('Dropped old username unique index');
        } catch (e) {
            console.log('No username index to drop or other error:', e.message);
        }

        console.log(`Found ${oldUsers.length} users. Starting migration...`);

        let migratedCount = 0;

        for (const oldUser of oldUsers) {
            // Check if user already exists in Mongo
            const existingUser = await User.findOne({ email: oldUser.email });
            if (existingUser) {
                console.log(`User ${oldUser.email} already migrating, skipping.`);
                continue;
            }

            // Fetch profile for this user from PostgreSQL
            const profileResult = await pgClient.query('SELECT * FROM profiles WHERE user_id = $1', [oldUser.id]);
            const oldProfile = profileResult.rows[0];

            let firstName = 'Unknown';
            let lastName = '.';

            if (oldProfile && oldProfile.first_name) {
                const nameParts = oldProfile.first_name.trim().split(' ');
                firstName = nameParts[0] || 'Unknown';
                lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';
            } else if (oldUser.username) {
                firstName = oldUser.username;
            }

            // Create New User Document
            const newUser = new User({
                firstName,
                lastName,
                email: oldUser.email,
                hashedPassword: oldUser.hashed_password,
                isActive: oldUser.is_active,
                isVerified: oldUser.is_verified,
                role: 'user', // old users are standard users generally unless specified
            });

            const savedUser = await newUser.save();

            // Create New Profile Document if old profile exists
            if (oldProfile) {

                // Map marital status
                let mStatus = oldProfile.marital_status ? oldProfile.marital_status.toLowerCase() : null;
                const oldToNewStatusMap = {
                    "single": "unmarried",
                    "widowed": "widow",
                    "separated": null
                };
                if (mStatus && oldToNewStatusMap[mStatus] !== undefined) {
                    mStatus = oldToNewStatusMap[mStatus];
                }
                if (!['unmarried', 'divorced', 'widow', 'widower'].includes(mStatus)) {
                    mStatus = undefined;
                }

                // Default birthPlace if missing
                const birthPlace = 'Not Specified';

                // Time of birth
                let timeOfBirth = oldProfile.time_of_birth;
                if (timeOfBirth && typeof timeOfBirth !== 'string') {
                    // Might be Date object or something else 
                    timeOfBirth = timeOfBirth.toString();
                }

                const newProfile = new Profile({
                    userId: savedUser._id,
                    profileCode: oldProfile.profile_code || `VLMIG${Date.now()}${migratedCount}`,
                    firstName: firstName,
                    lastName: lastName,
                    dateOfBirth: oldProfile.date_of_birth || new Date("2000-01-01"),
                    age: oldProfile.age || 20,
                    height: oldProfile.height,
                    birthPlace: birthPlace, // required in mongo
                    caste: oldProfile.caste,
                    subCaste: oldProfile.sub_caste,
                    gotra: oldProfile.gotra,
                    rashi: oldProfile.rashi,
                    nakshatra: oldProfile.nakshatra,
                    nadi: oldProfile.nadi,
                    timeOfBirth: timeOfBirth,
                    education: oldProfile.education,
                    occupation: oldProfile.occupation,
                    annualIncome: oldProfile.annual_income,
                    assets: oldProfile.assets,
                    currentLocation: oldProfile.current_location,
                    workingPlace: oldProfile.working_place,
                    maritalStatus: mStatus,
                    fatherName: oldProfile.father_name,
                    motherName: oldProfile.mother_name,
                    profileFor: oldProfile.profile_for,
                    brother: oldProfile.brother,
                    sister: oldProfile.sister,
                    sendersInfo: oldProfile.senders_info,
                    postalAddress: oldProfile.postal_address,
                    contactNumber: oldProfile.contact_number,
                    expectations: oldProfile.expectations,
                    isActive: oldProfile.is_active !== false,
                    isPublished: oldProfile.is_published === true,
                    isUnlocked: oldProfile.is_unlocked === true,
                });

                try {
                    await newProfile.save();
                } catch (pe) {
                    if (pe.code === 11000) {
                        console.log(`Profile ${newProfile.profileCode} already exists or has duplicate keys, skipping profile.`);
                    } else {
                        console.error(`Failed to save profile for ${oldUser.email}:`, pe.message);
                    }
                }
            }

            migratedCount++;
            console.log(`Migrated user: ${oldUser.email}`);
        }

        console.log(`Successfully migrated ${migratedCount} users and their profiles.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pgClient.end();
        await mongoose.connection.close();
        console.log('Connections closed.');
    }
}

migrateData();
