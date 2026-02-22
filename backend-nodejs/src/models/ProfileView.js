const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
        index: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate views
profileViewSchema.index({ userId: 1, profileId: 1 });

// Index for queries
profileViewSchema.index({ subscriptionId: 1, viewedAt: -1 });

const ProfileView = mongoose.model('ProfileView', profileViewSchema);

module.exports = ProfileView;
