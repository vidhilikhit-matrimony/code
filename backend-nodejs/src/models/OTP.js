const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otpCode: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    purpose: {
        type: String,
        enum: ['registration', 'password_reset'],
        required: true
    }
}, {
    timestamps: true
});

// TTL index - automatically delete expired OTPs after 1 hour
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

// Index for queries
otpSchema.index({ email: 1, purpose: 1, isUsed: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
