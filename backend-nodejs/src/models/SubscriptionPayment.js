const mongoose = require('mongoose');

const paymentStatusEnum = ['pending', 'approved', 'rejected', 'approved_manual'];

const subscriptionPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    planId: {
        type: String,
        required: function () { return this.status !== 'approved_manual'; }
    },
    planViews: {
        type: Number,
        required: true
    },
    grantedViews: {
        type: Number
    },
    amount: {
        type: Number,
        required: function () { return this.status !== 'approved_manual'; },
        min: 0
    },
    transactionDetails: {
        type: String,
        required: function () { return this.status !== 'approved_manual'; },
        trim: true
    },
    screenshotUrl: {
        type: String,
        required: function () { return this.status !== 'approved_manual'; }
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
