const mongoose = require('mongoose');

const subscriptionStatusEnum = ['pending', 'active', 'expired', 'revoked'];

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true
    },
    tokenGeneratedByAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    maxViews: {
        type: Number,
        required: true,
        min: 1
    },
    remainingViews: {
        type: Number,
        required: true,
        min: 0
    },
    hits: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date
    },
    validTo: {
        type: Date,
        index: true  // For expiration queries (now deprecated)
    },
    status: {
        type: String,
        enum: subscriptionStatusEnum,
        default: 'pending',
        index: true
    },
    unlockedProfileIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }]
}, {
    timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ token: 1, status: 1 });

// Check if subscription is valid
subscriptionSchema.methods.isValid = function () {
    return (
        this.status === 'active' &&
        this.remainingViews > 0
    );
};

// Decrement remaining views
subscriptionSchema.methods.decrementViews = async function () {
    if (this.remainingViews > 0) {
        this.remainingViews -= 1;
        this.hits += 1;
        await this.save();
        return true;
    }
    return false;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
