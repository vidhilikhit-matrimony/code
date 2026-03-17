const { SubscriptionPayment, Subscription, User, Plan } = require('../models');
const { uploadToS3, getPresignedUrl } = require('../services/uploadService');

/**
 * Submit a payment request
 * POST /api/subscriptions/payment
 */
const submitPayment = async (req, res, next) => {
    try {
        const { planId, transactionId } = req.body;
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Payment screenshot is required'
            });
        }

        if (!planId || !transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID and Transaction ID are required'
            });
        }

        // Fetch plan from DB
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }

        if (!plan.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Selected plan is no longer active'
            });
        }

        // Upload screenshot
        const screenshotUrl = await uploadToS3(
            req.file.buffer,
            req.file.originalname,
            'payment_screenshots',
            `payment_${userId}`
        );

        // Create payment record
        const payment = await SubscriptionPayment.create({
            userId,
            planId,
            planViews: plan.views,
            amount: plan.amount,
            transactionDetails: transactionId,
            screenshotUrl,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Payment submitted successfully. Verification pending.',
            data: payment
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get all pending payments (Admin)
 * GET /api/subscriptions/admin/pending
 */

/**
 * Get all pending payments (Admin)
 * GET /api/subscriptions/admin/pending
 */
const getPendingPayments = async (req, res, next) => {
    try {
        const payments = await SubscriptionPayment.find({ status: 'pending' })
            .populate('userId', 'firstName lastName email profileCode')
            .sort({ requestedAt: -1 });

        // Generate presigned URLs for screenshots
        const paymentsWithSignedUrls = await Promise.all(
            payments.map(async (payment) => {
                const paymentObj = payment.toObject();
                if (paymentObj.screenshotUrl) {
                    paymentObj.screenshotUrl = await getPresignedUrl(paymentObj.screenshotUrl);
                }
                return paymentObj;
            })
        );

        res.json({
            success: true,
            data: paymentsWithSignedUrls
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get recent approved payments (Admin)
 * GET /api/subscriptions/admin/recent-approved
 */
const getRecentApprovedPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Strictly from 11-March-2026 onwards for the frontend listing
        const START_DATE = new Date('2026-03-11T00:00:00.000Z');

        const filter = {
            status: 'approved',
            createdAt: { $gte: START_DATE }
        };

        const totalRecords = await SubscriptionPayment.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / parseInt(limit));

        const payments = await SubscriptionPayment.find(filter)
            .populate('userId', 'firstName lastName email profileCode')
            .sort({ processedAt: -1, requestedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Generate presigned URLs for screenshots
        const paymentsWithSignedUrls = await Promise.all(
            payments.map(async (payment) => {
                const paymentObj = payment.toObject();
                if (paymentObj.screenshotUrl) {
                    paymentObj.screenshotUrl = await getPresignedUrl(paymentObj.screenshotUrl);
                }
                return paymentObj;
            })
        );

        res.json({
            success: true,
            data: paymentsWithSignedUrls,
            totalPages,
            totalRecords,
            currentPage: parseInt(page)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify payment (Admin)
 * POST /api/subscriptions/admin/verify/:id
 */
const verifyPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, overrideViews } = req.body; // overrideViews: optional extra views
        const adminId = req.user._id;

        const payment = await SubscriptionPayment.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment already processed'
            });
        }

        if (status === 'rejected') {
            payment.status = 'rejected';
            payment.adminId = adminId;
            payment.adminNotes = adminNotes;
            payment.processedAt = Date.now();
            await payment.save();

            return res.json({
                success: true,
                message: 'Payment rejected'
            });
        }

        if (status === 'approved') {
            // Calculate views: Plan views + Admin override (if any)
            const finalViews = overrideViews ? parseInt(overrideViews) : payment.planViews;

            payment.status = 'approved';
            payment.adminId = adminId;
            payment.adminNotes = adminNotes;
            payment.processedAt = Date.now();
            payment.grantedViews = finalViews;
            await payment.save();

            // Create or update subscription
            // Note: Currently we'll create a new subscription or extend existing?
            // Assuming simplified logic: Create new subscription or add views to existing

            let subscription = await Subscription.findOne({ userId: payment.userId }).sort({ createdAt: -1 });

            const now = new Date();
            const validTo = new Date();
            validTo.setMonth(validTo.getMonth() + 3); // 3 months validity default

            if (subscription) {
                // Update existing
                subscription.remainingViews += finalViews;
                subscription.maxViews += finalViews;
                if (subscription.validTo < now) {
                    subscription.validTo = validTo; // Extend validity if expired
                } else {
                    // Extend validity by 3 months from current expiry? or just views?
                    // Let's extend from current expiry
                    const currentExpiry = new Date(subscription.validTo);
                    currentExpiry.setMonth(currentExpiry.getMonth() + 3);
                    subscription.validTo = currentExpiry;
                }
                subscription.status = 'active';
                await subscription.save();
            } else {
                // Create new
                const crypto = require('crypto');
                subscription = await Subscription.create({
                    userId: payment.userId,
                    token: crypto.randomBytes(16).toString('hex').toUpperCase(),
                    maxViews: finalViews,
                    remainingViews: finalViews,
                    validFrom: now,
                    validTo: validTo,
                    status: 'active'
                });
            }

            // --- Send Notification to User ---
            await User.findByIdAndUpdate(payment.userId, {
                pendingNotification: `Admin approved your subscription. You received ${finalViews} profile view counts and can now unlock profiles to get contact details.`
            });

            return res.json({
                success: true,
                message: `Payment approved. Added ${finalViews} views.`,
                data: {
                    payment,
                    subscription
                }
            });
        }

        res.status(400).json({
            success: false,
            message: 'Invalid status'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Grant manual unlocks without payment (Admin)
 * POST /api/subscriptions/admin/grant-manual
 */
const grantManualUnlock = async (req, res, next) => {
    try {
        const { userId, planViews, adminNotes } = req.body;
        const adminId = req.user._id;

        if (!userId || !planViews) {
            return res.status(400).json({
                success: false,
                message: 'User ID and number of views are required'
            });
        }

        const parsedViews = parseInt(planViews);
        if (isNaN(parsedViews) || parsedViews <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid number of views'
            });
        }

        // Check if user has a profile
        const hasProfile = await Profile.exists({ userId });
        if (!hasProfile) {
            return res.status(400).json({
                success: false,
                message: 'Cannot grant unlocks: User does not have a profile.'
            });
        }

        // Create the dummy manual payment record
        const payment = new SubscriptionPayment({
            userId,
            planViews: parsedViews,
            grantedViews: parsedViews,
            status: 'approved_manual',
            adminId,
            adminNotes: adminNotes || 'Granted manually without payment',
            processedAt: Date.now()
        });

        await payment.save();

        // Update or create subscription
        let subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });

        const now = new Date();
        const validTo = new Date();
        validTo.setMonth(validTo.getMonth() + 3); // 3 months validity

        if (subscription) {
            subscription.remainingViews += parsedViews;
            subscription.maxViews += parsedViews;
            if (subscription.validTo < now) {
                subscription.validTo = validTo;
            } else {
                const currentExpiry = new Date(subscription.validTo);
                currentExpiry.setMonth(currentExpiry.getMonth() + 3);
                subscription.validTo = currentExpiry;
            }
            subscription.status = 'active';
            await subscription.save();
        } else {
            const crypto = require('crypto');
            subscription = await Subscription.create({
                userId,
                token: crypto.randomBytes(16).toString('hex').toUpperCase(),
                maxViews: parsedViews,
                remainingViews: parsedViews,
                validFrom: now,
                validTo: validTo,
                status: 'active'
            });
        }

        // Notify User
        await User.findByIdAndUpdate(userId, {
            pendingNotification: `Admin manually granted you ${parsedViews} profile view counts.`
        });

        return res.json({
            success: true,
            message: `Successfully granted ${parsedViews} views.`,
            data: { payment, subscription }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get manual approved payments (Admin)
 * GET /api/subscriptions/admin/manual-approved
 */
const getManualApprovedPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { status: 'approved_manual' };

        const totalRecords = await SubscriptionPayment.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / parseInt(limit));

        const payments = await SubscriptionPayment.find(filter)
            .populate('userId', 'firstName lastName email profileCode')
            .populate('adminId', 'firstName lastName')
            .sort({ processedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: payments,
            totalPages,
            totalRecords,
            currentPage: parseInt(page)
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitPayment,
    getPendingPayments,
    getRecentApprovedPayments,
    verifyPayment,
    grantManualUnlock,
    getManualApprovedPayments
};
