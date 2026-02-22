const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const Profile = require('./src/models/Profile');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function setupAndRun() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create Verified User
        const email = `verified_user_${Date.now()}@example.com`;
        const password = 'password123'; // Will be hashed by pre-save hook? 
        // No, if we use create() directly, hooks run.

        const user = new User({
            username: `verified_${Date.now()}`,
            email,
            hashedPassword: password, // Note: Schema calls it hashedPassword but pre-save hashes it? 
            // In User.js: if (!this.isModified('hashedPassword')) return next();
            // So we can pass plain text if we let the hook run.
            isActive: true,
            isVerified: true
        });
        await user.save();
        console.log(`Created Verified User: ${user.email}`);

        // 2. Create Subscription
        const subscription = await Subscription.create({
            userId: user._id,
            token: `SUB_${Date.now()}`,
            maxViews: 10,
            remainingViews: 10,
            validFrom: new Date(),
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'active',
            unlockedProfileIds: []
        });
        console.log('Created Active Subscription with 10 views.');

        // 3. Find a Profile to Unlock
        const profile = await Profile.findOne({ isActive: true });
        if (!profile) {
            console.log('No profiles found in DB.');
            process.exit(1);
        }
        console.log(`Target Profile: ${profile._id}`);

        // 4. Authenticate via API
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });
        const token = loginRes.data.data.accessToken;
        console.log('Logged in via API. Token fragment:', token ? token.substring(0, 20) + '...' : 'none');
        if (!token) throw new Error('No token received from login');

        // 5. Test Unlock
        console.log('Attempting to Unlock...');
        const unlockRes = await axios.post(`${BASE_URL}/profiles/${profile._id}/unlock`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Unlock Response:', unlockRes.data);

        // 6. Verify Deduction
        const updatedSub = await Subscription.findById(subscription._id);
        console.log(`Remaining Views in DB: ${updatedSub.remainingViews} (Expected: 9)`);
        console.log(`Unlocked IDs: ${updatedSub.unlockedProfileIds}`);

        if (updatedSub.remainingViews === 9 && updatedSub.unlockedProfileIds.includes(profile._id)) {
            console.log('SUCCESS: View deducted and profile unlocked.');

            // Verify photos are present
            if (unlockRes.data.data.photos && Array.isArray(unlockRes.data.data.photos)) {
                console.log(`SUCCESS: Photos array present with ${unlockRes.data.data.photos.length} items.`);
            } else {
                console.log('FAILURE: Photos array missing or invalid.');
            }

            // 7. Verify List View (getAllProfiles)
            console.log('Verifying List View status...');
            const listRes = await axios.get(`${BASE_URL}/profiles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const unlockedProfileInList = listRes.data.data.profiles.find(p => p._id === profile._id.toString());

            if (unlockedProfileInList && unlockedProfileInList.isUnlocked === true) {
                console.log('SUCCESS: Profile is marked as unlocked in list view.');
            } else {
                console.log(`FAILURE: Profile in list view has isUnlocked=${unlockedProfileInList ? unlockedProfileInList.isUnlocked : 'not found'}`);
            }

        } else {
            console.log('FAILURE: DB state incorrect.');
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('API Response:', error.response.data);
    } finally {
        await mongoose.disconnect();
    }
}

setupAndRun();
