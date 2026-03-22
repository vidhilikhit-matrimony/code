const mongoose = require('mongoose');

const paymentStatusEnum = ['pending', 'approved', 'rejected'];
const paymentTypeEnum = ['payment', 'admin_grant'];

const subscriptionPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: paymentTypeEnum,
        default: 'payment',
        index: true
    },
    planId: {
        type: String
    },
    planViews: {
        type: Number
    },
    grantedViews: {
        type: Number
    },
    amount: {
        type: Number,
        default: 0,
        min: 0
    },
    transactionDetails: {
        type: String,
        trim: true
    },
    screenshotUrl: {
        type: String
    },
    status: {
        type: String,
        enum: paymentStatusEnum,
        default: 'pending',
        index: true
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminNotes: {
        type: String,
        trim: true
    },
    processedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for admin queries
subscriptionPaymentSchema.index({ status: 1, requestedAt: -1 });

const SubscriptionPayment = mongoose.model('SubscriptionPayment', subscriptionPaymentSchema);

module.exports = SubscriptionPayment;
