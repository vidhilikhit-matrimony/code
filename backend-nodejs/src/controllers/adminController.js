const { User, Profile, Subscription, SubscriptionPayment } = require('../models');

/**
 * Get Dashboard Stats
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalProfiles,
            publishedProfiles,
            pendingSubscriptions,
            totalRevenueResult
        ] = await Promise.all([
            User.countDocuments({}),
            Profile.countDocuments({}),
            Profile.countDocuments({ isPublished: true }),
            SubscriptionPayment.countDocuments({ status: 'pending' }),
            SubscriptionPayment.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProfiles,
                publishedProfiles,
                pendingSubscriptions,
                totalRevenue
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Users with Pagination & Search
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-hashedPassword')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalUsers: count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new user directly (Admin)
 * POST /api/admin/users
 */
const createUserAccount = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password are required'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        const user = await User.create({
            username,
            email,
            hashedPassword: password,
            isVerified: true,
            role: role || 'user'
        });

        const userData = user.toJSON();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle User Active Status
 * PUT /api/admin/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-hashedPassword');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Also update profiles associated with this user
        await Profile.updateMany(
            { userId: id },
            { isActive }
        );

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Permanently Delete User and Associated Data
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user.id === id) {
            return res.status(403).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 1. Delete all profiles associated with this user
        await Profile.deleteMany({ userId: id });

        // 2. Delete the subscription associated with this user (if any)
        await Subscription.deleteMany({ userId: id });

        // 3. Delete the user document
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'User and all associated data have been permanently deleted'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Profiles (Admin View)
 * GET /api/admin/profiles
 */
const getAllProfilesAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { profileCode: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'published') query.isPublished = true;
        if (status === 'unpublished') query.isPublished = false;

        const profiles = await Profile.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Profile.countDocuments(query);

        // Enhance profiles with subscription info (unlocks left)
        const enhancedProfiles = await Promise.all(
            profiles.map(async (profile) => {
                const pObj = profile.toObject();
                // A profile belongs to a userId, the subscription is associated with that userId
                const subscription = await Subscription.findOne({ userId: profile.userId._id });
                if (subscription) {
                    pObj.subscriptionId = subscription._id;
                    pObj.unlocksLeft = subscription.remainingViews;
                    pObj.hasSubscription = true;
                } else {
                    pObj.unlocksLeft = 0;
                    pObj.hasSubscription = false;
                }
                return pObj;
            })
        );

        res.status(200).json({
            success: true,
            data: enhancedProfiles,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalProfiles: count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update User Subscription Unlocks (Admin)
 * PUT /api/admin/subscriptions/:id/unlocks
 */
const updateSubscriptionUnlocks = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { unlocksLeft } = req.body;

        if (unlocksLeft === undefined || unlocksLeft < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid unlocks count'
            });
        }

        const updateData = { remainingViews: unlocksLeft };
        if (unlocksLeft > 0) {
            updateData.status = 'active';
            // Also ensure it is valid from today if it was pending or expired
            updateData.validFrom = new Date();
            // Optional: extend validity by 1 year if needed, but for now just make sure it's active
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            updateData.validTo = oneYearFromNow;
        } else {
            updateData.status = 'expired';
        }

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Unlocks updated successfully',
            data: subscription
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    createUserAccount,
    toggleUserStatus,
    deleteUser,
    getAllProfilesAdmin,
    updateSubscriptionUnlocks
};
