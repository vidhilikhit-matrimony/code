const { User, Profile, Subscription } = require('../models');

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
            Subscription.countDocuments({ 'paymentHistory.status': 'pending' }),
            Subscription.aggregate([
                { $unwind: '$paymentHistory' },
                { $match: { 'paymentHistory.status': 'approved' } },
                { $group: { _id: null, total: { $sum: '$paymentHistory.amount' } } }
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

        res.status(200).json({
            success: true,
            data: profiles,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalProfiles: count
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    toggleUserStatus,
    getAllProfilesAdmin
};
