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

        // Block duplicate pending payment
        const existingPending = await SubscriptionPayment.findOne({ userId, status: 'pending', type: 'payment' });
        if (existingPending) {
            return res.status(409).json({
                success: false,
                message: 'You already have a payment awaiting verification. Please wait for the admin to approve or reject it before submitting again.'
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
 * Get current user's own pending payment status
 * GET /api/subscriptions/my-status
 */
const getMyPaymentStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const pending = await SubscriptionPayment.findOne(
            { userId, status: 'pending', type: 'payment' },
            { status: 1, requestedAt: 1, transactionDetails: 1 }
        ).sort({ requestedAt: -1 });

        res.json({
            success: true,
            hasPending: !!pending,
            payment: pending || null
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
    getMyPaymentStatus
};
