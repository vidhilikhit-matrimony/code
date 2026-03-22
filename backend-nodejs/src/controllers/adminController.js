const { User, Profile, Subscription, SubscriptionPayment } = require('../models');

/**
 * Get Dashboard Stats
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const {
            registeredUsersRange = 'all',
            createdProfilesRange = 'all',
            newSubscriptionsRange = 'all',
            renewedSubscriptionsRange = 'all',
            deletedAccountsRange = 'all',
            subscriptionRevenueRange = 'all',
            renewalRevenueRange = 'all',
            totalEarnedRange = 'all'
        } = req.query;

        const getStartDate = (range) => {
            if (!range || range === 'all') return null;
            const date = new Date();
            date.setHours(0, 0, 0, 0); // Start of day by default
            if (range === '7') date.setDate(date.getDate() - 7);
            else if (range === '30') date.setDate(date.getDate() - 30);
            else if (range === '180') date.setDate(date.getDate() - 180);
            else if (range === '365') date.setDate(date.getDate() - 365);
            return date;
        };

        const REVENUE_START_DATE = new Date('2026-03-11T00:00:00.000Z');

        // 1. Registered Users
        const regStartDate = getStartDate(registeredUsersRange);
        const regFilter = regStartDate ? { createdAt: { $gte: regStartDate } } : {};
        const registeredUsers = await User.countDocuments(regFilter);

        // 2. Created Profiles
        const proStartDate = getStartDate(createdProfilesRange);
        const proFilter = proStartDate ? { createdAt: { $gte: proStartDate } } : {};
        const createdProfiles = await Profile.countDocuments(proFilter);

        // 5. Deleted Accounts/Profiles
        const delStartDate = getStartDate(deletedAccountsRange);
        const delFilter = delStartDate ? { isDeleted: true, deletedAt: { $gte: delStartDate } } : { isDeleted: true };
        const deletedAccounts = await Profile.countDocuments(delFilter);

        let newSubscriptions = 0;
        let renewedSubscriptions = 0;
        let subscriptionRevenue = 0;
        let renewalRevenue = 0;
        let totalEarned = 0;

        const payments = await SubscriptionPayment.aggregate([
            { $match: { status: 'approved' } },
            { $sort: { createdAt: 1 } },
            {
                $group: {
                    _id: '$userId',
                    payments: {
                        $push: {
                            date: '$createdAt',
                            amount: { $ifNull: ['$amount', 0] }
                        }
                    }
                }
            }
        ]);

        const newSubStartDate = getStartDate(newSubscriptionsRange);
        const renSubStartDate = getStartDate(renewedSubscriptionsRange);
        const subRevStartDate = getStartDate(subscriptionRevenueRange);
        const renRevStartDate = getStartDate(renewalRevenueRange);
        const totEarStartDate = getStartDate(totalEarnedRange);

        payments.forEach(userPayments => {
            const userHistory = userPayments.payments;
            if (userHistory.length > 0) {
                const firstPayment = userHistory[0];
                const firstDate = new Date(firstPayment.date);
                const firstAmount = firstPayment.amount || 0;

                // New Subscriptions count
                if (!newSubStartDate || firstDate >= newSubStartDate) {
                    newSubscriptions++;
                }

                // Revenue calculations
                // Strictly respect March 11, 2026 start date requested by user for counting revenue
                if (firstDate >= REVENUE_START_DATE) {
                    // Subscription Revenue
                    if (!subRevStartDate || firstDate >= subRevStartDate) {
                        subscriptionRevenue += firstAmount;
                    }
                    // Total Earned
                    if (!totEarStartDate || firstDate >= totEarStartDate) {
                        totalEarned += firstAmount;
                    }
                }

                // Renewals
                for (let i = 1; i < userHistory.length; i++) {
                    const renewal = userHistory[i];
                    const renewalDate = new Date(renewal.date);
                    const renewalAmount = renewal.amount || 0;

                    // Renewed Subscriptions count
                    if (!renSubStartDate || renewalDate >= renSubStartDate) {
                        renewedSubscriptions++;
                    }

                    if (renewalDate >= REVENUE_START_DATE) {
                        // Renewal Revenue
                        if (!renRevStartDate || renewalDate >= renRevStartDate) {
                            renewalRevenue += renewalAmount;
                        }
                        // Total Earned
                        if (!totEarStartDate || renewalDate >= totEarStartDate) {
                            totalEarned += renewalAmount;
                        }
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                registeredUsers,
                createdProfiles,
                newSubscriptions,
                renewedSubscriptions,
                deletedAccounts,
                subscriptionRevenue,
                renewalRevenue,
                totalEarned
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
        const { page = 1, limit = 10, search, hasProfile, sortField, sortOrder, status, startDate, endDate } = req.query;
        const query = {};

        if (hasProfile !== undefined) {
            const profileUserIds = await Profile.distinct('userId');
            if (hasProfile === 'true') {
                query._id = { $in: profileUserIds };
            } else {
                query._id = { $nin: profileUserIds };
            }
        }

        if (status) {
            if (status === 'active') query.isActive = true;
            if (status === 'inactive') query.isActive = false;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        let sortConfig = { createdAt: -1 };
        if (sortField) {
            const order = sortOrder === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'name':
                    sortConfig = { firstName: order, lastName: order };
                    break;
                case 'status':
                    sortConfig = { isActive: order };
                    break;
                case 'joined':
                    sortConfig = { createdAt: order };
                    break;
            }
        }

        const users = await User.find(query)
            .select('-hashedPassword')
            .sort(sortConfig)
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
        const { firstName, lastName, email, password, role } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, email and password are required'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const user = await User.create({
            firstName,
            lastName,
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
            {
                isActive,
                inactiveDate: isActive ? null : new Date()
            }
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
        const { page = 1, limit = 10, search, status, isActive, renewRequired } = req.query;
        const query = {};

        if (renewRequired === 'true') {
            const subscriptions = await Subscription.find({ remainingViews: { $lte: 5 } });
            const userIdsWithLowViews = subscriptions.map(sub => sub.userId);
            query.userId = { $in: userIdsWithLowViews };
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { profileCode: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'published') query.isPublished = true;
        if (status === 'unpublished') query.isPublished = false;

        let sortConfig = { createdAt: -1 };
        if (isActive === 'false') {
            sortConfig = { inactiveDate: -1, deletedAt: -1, createdAt: -1 };
        }

        const profiles = await Profile.find(query)
            .populate('userId', 'firstName lastName email')
            .sort(sortConfig)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Profile.countDocuments(query);

        // Enhance profiles with subscription info (unlocks left)
        const enhancedProfiles = await Promise.all(
            profiles.map(async (profile) => {
                const pObj = profile.toObject();
                // A profile belongs to a userId, the subscription is associated with that userId
                const subscription = await Subscription.findOne({ userId: profile.userId._id }).sort({ createdAt: -1 });
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

/**
 * Grant Unlocks Without Payment (Admin)
 * POST /api/admin/subscriptions/grant
 */
const grantUnlocksWithoutPayment = async (req, res, next) => {
    try {
        const { userId, unlocksToAdd, adminNotes } = req.body;
        const adminId = req.user._id;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const unlocks = parseInt(unlocksToAdd);
        if (!unlocks || unlocks <= 0 || unlocks > 9999) {
            return res.status(400).json({ success: false, message: 'Unlocks must be a positive number (max 9999)' });
        }

        // Verify the user has an active profile
        const activeProfile = await Profile.findOne({ userId, isActive: true });
        if (!activeProfile) {
            return res.status(400).json({
                success: false,
                message: 'No active profile found for this user. Unlocks can only be granted to users with an active profile.'
            });
        }

        // Find or create subscription
        let subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (subscription) {
            subscription.remainingViews += unlocks;
            subscription.maxViews += unlocks;
            // Extend validity
            if (subscription.validTo < now) {
                subscription.validTo = oneYearFromNow;
                subscription.validFrom = now;
            } else {
                const extended = new Date(subscription.validTo);
                extended.setFullYear(extended.getFullYear() + 1);
                subscription.validTo = extended;
            }
            subscription.status = 'active';
            await subscription.save();
        } else {
            const crypto = require('crypto');
            subscription = await Subscription.create({
                userId,
                token: crypto.randomBytes(16).toString('hex').toUpperCase(),
                maxViews: unlocks,
                remainingViews: unlocks,
                validFrom: now,
                validTo: oneYearFromNow,
                status: 'active',
                tokenGeneratedByAdminId: adminId
            });
        }

        // Create admin_grant record for audit trail
        await SubscriptionPayment.create({
            userId,
            type: 'admin_grant',
            grantedViews: unlocks,
            amount: 0,
            transactionDetails: 'Admin Grant - No Payment',
            status: 'approved',
            adminId,
            adminNotes: adminNotes || '',
            processedAt: now
        });

        // Notify the user
        await User.findByIdAndUpdate(userId, {
            pendingNotification: `Admin has granted you ${unlocks} profile unlock${unlocks > 1 ? 's' : ''}. You can now view contact details of profiles.`
        });

        return res.status(200).json({
            success: true,
            message: `Successfully granted ${unlocks} unlock${unlocks > 1 ? 's' : ''} to the user.`,
            data: { subscription }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get Admin Granted Payments (without payment) — Admin
 * GET /api/admin/subscriptions/admin-granted
 */
const getAdminGrantedPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { type: 'admin_grant' };

        const totalRecords = await SubscriptionPayment.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / parseInt(limit));

        const grants = await SubscriptionPayment.find(filter)
            .populate('userId', 'firstName lastName email')
            .populate('adminId', 'firstName lastName email')
            .sort({ processedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json({
            success: true,
            data: grants,
            totalPages: totalPages || 1,
            totalRecords,
            currentPage: parseInt(page)
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
    updateSubscriptionUnlocks,
    grantUnlocksWithoutPayment,
    getAdminGrantedPayments
};
