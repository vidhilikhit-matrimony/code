const mongoose = require('mongoose');

const paymentStatusEnum = ['pending', 'approved', 'rejected'];

const subscriptionPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    planId: {
        type: String,
        required: true,
        enum: ['basic', 'standard', 'premium'] // basic=1000, standard=1500, premium=3000
    },
    planViews: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionDetails: {
        type: String,
        required: true,
        trim: true
    },
    screenshotUrl: {
        type: String,
        required: true
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
