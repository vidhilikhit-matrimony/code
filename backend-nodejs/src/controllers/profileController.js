const { Profile, ProfileView, Subscription } = require('../models');
const { uploadToS3, getPresignedUrl } = require('../services/uploadService');

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Calculate age from date of birth
 */
const calculateAge = (dob) => {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

/**
 * Generate unique profile code: VL{caste_code}{gender_code}{sequence}
 * Example: VLbm001 (VL + brahmin + male + 001)
 */
const generateProfileCode = async (caste, gender) => {
    const prefix = 'VL';
    const casteCode = caste ? caste.toLowerCase()[0] : 'x';

    let genderCode = 'u';
    if (gender) {
        const g = gender.toLowerCase();
        if (g === 'm' || g === 'male') genderCode = 'm';
        else if (g === 'f' || g === 'female') genderCode = 'f';
    }

    const pattern = `${prefix}${casteCode}${genderCode}`;

    // Find existing profiles matching this pattern
    const existing = await Profile.find({
        profileCode: { $regex: `^${pattern}`, $options: 'i' }
    }).select('profileCode');

    // Extract and find max sequence number
    let maxSeq = 0;
    for (const p of existing) {
        const seqStr = p.profileCode.slice(pattern.length);
        const seq = parseInt(seqStr, 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }

    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `${pattern}${nextSeq}`;
};

/**
 * Build a MongoDB filter query from request query params
 */
const buildFilterQuery = (query, currentUserId) => {
    // Default: active (true or missing) and not deleted (false or missing)
    const filter = {
        isActive: { $ne: false },
        isDeleted: { $ne: true }
    };

    // Exclude current user's profile
    filter.userId = { $ne: currentUserId };

    // Published only
    if (query.publishedOnly === 'true') {
        filter.isPublished = true;
    }

    // Community (caste)
    if (query.community) {
        const c = query.community.toLowerCase();
        if (c === 'brahmin') filter.caste = { $regex: 'brahmin', $options: 'i' };
        else if (c === 'lingayat') filter.caste = { $regex: 'lingayat', $options: 'i' };
    }

    // Gender (stored in profileCode: 4th char)
    if (query.gender) {
        const g = query.gender.toLowerCase();
        if (g === 'male' || g === 'm') {
            filter.profileCode = { $regex: '^.{3}m', $options: 'i' };
        } else if (g === 'female' || g === 'f') {
            filter.profileCode = { $regex: '^.{3}f', $options: 'i' };
        }
    }

    // Age range
    if (query.ageRange) {
        const ranges = {
            '18-24': [18, 24],
            '25-34': [25, 34],
            '35-44': [35, 44],
            '45-54': [45, 54],
            '55-60': [55, 60]
        };
        if (ranges[query.ageRange]) {
            const [min, max] = ranges[query.ageRange];
            filter.age = { $gte: min, $lte: max };
        }
    } else {
        if (query.ageMin) filter.age = { ...filter.age, $gte: parseInt(query.ageMin) };
        if (query.ageMax) filter.age = { ...filter.age, $lte: parseInt(query.ageMax) };
    }

    // Marital status
    if (query.maritalStatus) {
        const ms = query.maritalStatus.toLowerCase();
        if (ms === 'divorce' || ms === 'divorced') {
            filter.maritalStatus = 'divorced';
        } else if (ms === 'widow') {
            filter.maritalStatus = { $in: ['widow', 'widower'] };
        } else if (ms === 'unmarried') {
            filter.maritalStatus = 'unmarried';
        }
    }

    // Country / NRI filter
    if (query.country) {
        const c = query.country.toLowerCase();
        if (c === 'india') {
            filter.country = { $regex: '^india$', $options: 'i' };
        } else if (c === 'nri') {
            // NRI = country is set and is NOT India
            filter.country = { $not: { $regex: '^india$', $options: 'i' }, $ne: null, $ne: '' };
        }
    }

    return filter;
};

/**
 * Get primary photo URL from profile (presigned)
 */
const getPrimaryPhoto = async (profile) => {
    if (!profile.photos || profile.photos.length === 0) return null;
    const primary = profile.photos.find(p => p.isPrimary);
    const rawUrl = primary ? primary.url : profile.photos[0]?.url || null;
    if (!rawUrl) return null;
    return await getPresignedUrl(rawUrl);
};

/**
 * Format profile for limited (locked) response
 */
const toLimitedProfile = async (profile) => ({
    _id: profile._id,
    profileCode: profile.profileCode,
    firstName: profile.firstName,
    dateOfBirth: profile.dateOfBirth,
    age: profile.age,
    height: profile.height,
    maritalStatus: profile.maritalStatus || null,
    caste: profile.caste && profile.gotra
        ? `${profile.caste}-${profile.gotra}`
        : profile.caste || 'N/A',
    gotra: profile.gotra || null,
    nakshatra: [profile.nakshatra, profile.nadi].filter(Boolean).join('/') || 'N/A',
    nadi: profile.nadi || null,
    education: profile.education || profile.occupation || 'N/A',
    occupation: profile.occupation || null,
    currentLocation: profile.currentLocation || 'N/A',
    annualIncome: profile.annualIncome || null,
    photoUrl: await getPrimaryPhoto(profile),
    isUnlocked: false
});

/**
 * Format profile for full (unlocked) response
 */
const toFullProfile = async (profile) => {
    // Sign all photo URLs
    const signedPhotos = await Promise.all(
        (profile.photos || []).map(async (p) => ({
            url: await getPresignedUrl(p.url),
            isPrimary: p.isPrimary
        }))
    );

    return {
        _id: profile._id,
        userId: profile.userId,
        profileCode: profile.profileCode,
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth,
        age: profile.age,
        height: profile.height,
        caste: profile.caste,
        subCaste: profile.subCaste,
        gotra: profile.gotra,
        rashi: profile.rashi,
        nakshatra: profile.nakshatra,
        nadi: profile.nadi,
        timeOfBirth: profile.timeOfBirth,
        education: profile.education,
        occupation: profile.occupation,
        annualIncome: profile.annualIncome,
        assets: profile.assets,
        currentLocation: profile.currentLocation,
        workingPlace: profile.workingPlace,
        country: profile.country,
        maritalStatus: profile.maritalStatus,
        fatherName: profile.fatherName,
        motherName: profile.motherName,
        profileFor: profile.profileFor,
        brother: profile.brother,
        sister: profile.sister,
        sendersInfo: profile.sendersInfo,
        postalAddress: profile.postalAddress,
        contactNumber: profile.contactNumber,
        expectations: profile.expectations,
        photoUrl: await getPrimaryPhoto(profile),
        photos: signedPhotos,
        isActive: profile.isActive,
        isPublished: profile.isPublished,
        isUnlocked: true,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
    };
};

// ─── Controllers ───────────────────────────────────────────────────

/**
 * Create or update profile
 * POST /api/profiles
 */
const createOrUpdateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.dateOfBirth || !data.gender) {
            return res.status(400).json({
                success: false,
                message: 'firstName, lastName, dateOfBirth, and gender are required'
            });
        }

        // Calculate age
        const age = calculateAge(data.dateOfBirth);
        if (age < 18 || age > 100) {
            return res.status(400).json({
                success: false,
                message: 'Age must be between 18 and 100'
            });
        }

        // Validate marital status
        const validStatuses = ['unmarried', 'divorced', 'widow', 'widower'];
        if (data.maritalStatus && !validStatuses.includes(data.maritalStatus.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid marital status. Allowed: ${validStatuses.join(', ')}`
            });
        }

        // Check for existing profile
        let profile = await Profile.findOne({ userId });

        if (profile) {
            // Update existing profile
            Object.assign(profile, {
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth),
                age,
                height: data.height || profile.height,
                caste: data.caste || profile.caste,
                subCaste: data.subCaste || profile.subCaste,
                gotra: data.gotra || profile.gotra,
                rashi: data.rashi || profile.rashi,
                nakshatra: data.nakshatra || profile.nakshatra,
                nadi: data.nadi || profile.nadi,
                timeOfBirth: data.timeOfBirth || profile.timeOfBirth,
                education: data.education || profile.education,
                occupation: data.occupation || profile.occupation,
                annualIncome: data.annualIncome || profile.annualIncome,
                assets: data.assets || profile.assets,
                currentLocation: data.currentLocation || profile.currentLocation,
                workingPlace: data.workingPlace || profile.workingPlace,
                country: data.country || profile.country,
                maritalStatus: data.maritalStatus?.toLowerCase() || profile.maritalStatus,
                fatherName: data.fatherName || profile.fatherName,
                motherName: data.motherName || profile.motherName,
                profileFor: data.profileFor || profile.profileFor,
                brother: data.brother || profile.brother,
                sister: data.sister || profile.sister,
                sendersInfo: data.sendersInfo || profile.sendersInfo,
                postalAddress: data.postalAddress || profile.postalAddress,
                contactNumber: data.contactNumber || profile.contactNumber,
                expectations: data.expectations || profile.expectations,
                isPublished: true
            });

            await profile.save();
        } else {
            // Generate profile code
            const profileCode = await generateProfileCode(data.caste, data.gender);

            profile = await Profile.create({
                userId,
                profileCode,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth),
                age,
                height: data.height,
                caste: data.caste,
                subCaste: data.subCaste,
                gotra: data.gotra,
                rashi: data.rashi,
                nakshatra: data.nakshatra,
                nadi: data.nadi,
                timeOfBirth: data.timeOfBirth,
                education: data.education,
                occupation: data.occupation,
                annualIncome: data.annualIncome,
                assets: data.assets,
                currentLocation: data.currentLocation,
                workingPlace: data.workingPlace,
                country: data.country,
                maritalStatus: data.maritalStatus?.toLowerCase(),
                fatherName: data.fatherName,
                motherName: data.motherName,
                profileFor: data.profileFor,
                brother: data.brother,
                sister: data.sister,
                sendersInfo: data.sendersInfo,
                postalAddress: data.postalAddress,
                contactNumber: data.contactNumber,
                expectations: data.expectations,
                isActive: true,
                isPublished: true
            });
        }

        // Handle photo uploads
        if (req.files) {
            try {
                // 1. Handle Profile Photo (Primary)
                if (req.files.profilePhoto) {
                    const file = req.files.profilePhoto[0];
                    const photoUrl = await uploadToS3(
                        file.buffer,
                        file.originalname,
                        'profile_photos',
                        `profile_${userId}`
                    );

                    // Mark all existing photos as non-primary
                    profile.photos.forEach(p => { p.isPrimary = false; });

                    // Add new photo as primary
                    profile.photos.push({
                        url: photoUrl,
                        isPrimary: true
                    });
                }

                // 2. Handle Gallery Images (Non-Primary)
                if (req.files.galleryImages) {
                    for (const file of req.files.galleryImages) {
                        const photoUrl = await uploadToS3(
                            file.buffer,
                            file.originalname,
                            'profile_gallery',
                            `gallery_${userId}`
                        );

                        profile.photos.push({
                            url: photoUrl,
                            isPrimary: false
                        });
                    }
                }

                await profile.save();
            } catch (uploadError) {
                console.error('Photo upload failed:', uploadError.message);
                // Don't fail the whole request if photo upload fails
            }
        }

        res.status(profile.isNew ? 201 : 200).json({
            success: true,
            message: profile.isNew
                ? 'Profile created successfully'
                : 'Profile updated successfully',
            data: await toFullProfile(profile)
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's profile
 * GET /api/profiles/me
 */
const getMyProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please create your profile first.'
            });
        }

        const subscription = await Subscription.findOne({ userId: req.user._id });
        const fullProfile = await toFullProfile(profile);

        res.json({
            success: true,
            data: {
                ...fullProfile,
                subscriptionStatus: subscription ? subscription.status : 'inactive',
                subscriptionValidTo: subscription ? subscription.validTo : null
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * List all profiles with filters and pagination
 * GET /api/profiles
 */
const getAllProfiles = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
        const skip = (page - 1) * limit;

        // req.user may be undefined for guest (unauthenticated) requests
        const currentUserId = req.user?._id || null;

        // Build filter — pass null if no user
        const filter = buildFilterQuery(req.query, currentUserId);

        // Admin override: only available to authenticated admins
        if (req.user?.role === 'admin') {
            if (req.query.status === 'deleted') {
                filter.isDeleted = true;
                delete filter.isActive;
            } else if (req.query.status === 'all') {
                delete filter.isActive;
                delete filter.isDeleted;
            }
        }

        // Get total count
        const total = await Profile.countDocuments(filter);

        // Get profiles
        const profiles = await Profile.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Unlocked profile IDs — only meaningful for authenticated users
        let unlockedProfileIds = [];
        if (currentUserId) {
            const subscription = await Subscription.findOne({ userId: currentUserId });
            unlockedProfileIds = subscription?.unlockedProfileIds?.map(id => id.toString()) || [];
        }

        // Format: guests always see limited profiles
        const profileList = await Promise.all(profiles.map(async (profile) => {
            const isUnlocked = currentUserId && (
                profile.isUnlocked ||
                unlockedProfileIds.includes(profile._id.toString()) ||
                profile.userId?.toString() === currentUserId.toString()
            );

            if (isUnlocked) {
                const fullProfile = await toFullProfile(profile);
                fullProfile.isUnlocked = true;
                return fullProfile;
            }
            return await toLimitedProfile(profile);
        }));

        const totalPages = Math.ceil(total / limit) || 1;

        res.json({
            success: true,
            data: {
                total,
                page,
                pageSize: limit,
                totalPages,
                profiles: profileList
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get profile by ID
 * GET /api/profiles/:id
 */
const getProfileById = async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // req.user may be undefined for guest requests
        const currentUserId = req.user?._id || null;
        const isOwnProfile = currentUserId && profile.userId?.toString() === currentUserId.toString();
        const isAdmin = req.user?.role === 'admin';

        // Hide deleted / inactive profiles from others
        if ((profile.isDeleted || profile.isActive === false) && !isOwnProfile && !isAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Owner gets full profile + subscription info
        if (isOwnProfile) {
            const subscription = await Subscription.findOne({ userId: currentUserId });
            const fullProfile = await toFullProfile(profile);
            return res.json({
                success: true,
                data: {
                    ...fullProfile,
                    subscriptionStatus: subscription ? subscription.status : 'inactive',
                    subscriptionValidTo: subscription ? subscription.validTo : null
                }
            });
        }

        // Profile marked as fully unlocked globally
        if (profile.isUnlocked) {
            return res.json({
                success: true,
                data: await toFullProfile(profile)
            });
        }

        // Authenticated user: check if they explicitly unlocked this profile
        if (currentUserId) {
            const subscription = await Subscription.findOne({ userId: currentUserId });
            const isUnlocked = subscription?.unlockedProfileIds?.some(
                id => id.toString() === req.params.id
            );
            if (isUnlocked) {
                return res.json({
                    success: true,
                    data: await toFullProfile(profile)
                });
            }
        }

        // Guest or locked — return limited data
        res.json({
            success: true,
            data: await toLimitedProfile(profile)
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Unlock a profile (deduct view)
 * POST /api/profiles/:id/unlock
 */
const unlockProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // 1. Check if profile exists
        const profile = await Profile.findById(id);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // 2. Get user's subscription
        const subscription = await Subscription.findOne({ userId });

        if (!subscription || !subscription.isValid()) {
            return res.status(403).json({
                success: false,
                message: 'No active subscription found. Please upgrade your plan.'
            });
        }

        // 3. Check if already unlocked
        if (subscription.unlockedProfileIds && subscription.unlockedProfileIds.includes(id)) {
            return res.json({
                success: true,
                message: 'Profile already unlocked',
                data: await toFullProfile(profile)
            });
        }

        // 4. Check remaining views
        if (subscription.remainingViews <= 0) {
            return res.status(403).json({
                success: false,
                message: 'You have used all your profile views. Please upgrade your plan.'
            });
        }

        // 5. Deduct view and unlock
        subscription.remainingViews -= 1;
        subscription.hits += 1;
        if (!subscription.unlockedProfileIds) subscription.unlockedProfileIds = [];
        subscription.unlockedProfileIds.push(id);
        await subscription.save();

        res.json({
            success: true,
            message: 'Profile unlocked successfully',
            data: await toFullProfile(profile),
            remainingViews: subscription.remainingViews
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete profile (Soft delete for user, Hard delete for admin)
 * DELETE /api/profiles/:id
 */
const deleteProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const isAdmin = req.user.role === 'admin';
        const isOwner = profile.userId.toString() === req.user._id.toString();

        console.log(`[DELETE PROFILE] User: ${req.user.username}, Role: ${req.user.role}, IsAdmin: ${isAdmin}, IsOwner: ${isOwner}`);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this profile'
            });
        }

        const { deleteFromS3 } = require('../services/uploadService');

        if (isAdmin) {
            console.log('[DELETE PROFILE] Performing hard delete (Admin)');
            // Hard Delete
            // 1. Delete photos from S3
            if (profile.photos && profile.photos.length > 0) {
                for (const photo of profile.photos) {
                    try {
                        await deleteFromS3(photo.url);
                    } catch (err) {
                        console.error(`[DELETE PROFILE] Failed to delete photo ${photo.url}:`, err.message);
                    }
                }
            }

            // 2. Delete from DB
            await Profile.findByIdAndDelete(req.params.id);

            // 3. Clean up related data (optional: remove views, etc. if needed)

            return res.json({
                success: true,
                message: 'Profile permanently deleted'
            });

        } else {
            // Soft Delete
            profile.isDeleted = true;
            profile.isActive = false;
            profile.deletedAt = new Date();
            await profile.save();

            return res.json({
                success: true,
                message: 'Profile deactivated successfully'
            });
        }

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrUpdateProfile,
    getMyProfile,
    getAllProfiles,
    getProfileById,
    unlockProfile,
    deleteProfile
};
