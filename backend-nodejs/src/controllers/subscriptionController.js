const { SubscriptionPayment, Subscription, User } = require('../models');
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

        // Define plans
        const plans = {
            'basic': { amount: 1000, views: 30 },
            'standard': { amount: 1500, views: 50 },
            'premium': { amount: 3000, views: 100 }
        };

        const plan = plans[planId];
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
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
            .populate('userId', 'username email profileCode')
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
            payment.status = 'approved';
            payment.adminId = adminId;
            payment.adminNotes = adminNotes;
            payment.processedAt = Date.now();
            await payment.save();

            // Calculate views: Plan views + Admin override (if any)
            const finalViews = overrideViews ? parseInt(overrideViews) : payment.planViews;

            // Create or update subscription
            // Note: Currently we'll create a new subscription or extend existing?
            // Assuming simplified logic: Create new subscription or add views to existing

            let subscription = await Subscription.findOne({ userId: payment.userId });

            const now = new Date();
            const validTo = new Date();
            validTo.setMonth(validTo.getMonth() + 3); // 3 months validity default

            if (subscription) {
                // Update existing
                subscription.remainingViews += finalViews;
                subscription.maxViews += finalViews;
                if (subscription.validTo < now) {
                    subscription.validTo = validTo; // Extend validity if expired
                    subscription.status = 'active';
                } else {
                    // Extend validity by 3 months from current expiry? or just views?
                    // Let's extend from current expiry
                    const currentExpiry = new Date(subscription.validTo);
                    currentExpiry.setMonth(currentExpiry.getMonth() + 3);
                    subscription.validTo = currentExpiry;
                }
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

module.exports = {
    submitPayment,
    getPendingPayments,
    verifyPayment
};
