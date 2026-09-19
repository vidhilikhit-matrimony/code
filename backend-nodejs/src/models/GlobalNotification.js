const mongoose = require('mongoose');

const globalNotificationSchema = new mongoose.Schema({
    message: { 
        type: String, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    type: { 
        type: String, 
        enum: ['info', 'warning', 'success', 'error'], 
        default: 'info' 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    targetGender: {
        type: String,
        enum: ['All', 'Male', 'Female'],
        default: 'All'
    },
    targetSubscription: {
        type: String,
        enum: ['All', 'Premium', 'Free'],
        default: 'All'
    },
    targetCommunity: {
        type: String,
        enum: ['All', 'Brahmin', 'Lingayat'],
        default: 'All'
    },
    targetProfileStatus: {
        type: String,
        enum: ['All', 'Has Profile', 'No Profile'],
        default: 'All'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GlobalNotification', globalNotificationSchema);
