const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name must not exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name must not exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    hashedPassword: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    pendingNotification: {
        type: String,
        default: null
    }
}, {
    timestamps: true  // Creates createdAt and updatedAt automatically
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('hashedPassword')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    // 1. Standard check: plain bcrypt (for new users or after password reset)
    const isMatch = await bcrypt.compare(candidatePassword, this.hashedPassword);
    if (isMatch) return true;

    const crypto = require('crypto');

    // 2. Fallback for migrated users: old system used SHA-256, then we bcrypt-hashed that
    const sha256Hash = crypto.createHash('sha256').update(candidatePassword).digest('hex');
    const isSha256Match = await bcrypt.compare(sha256Hash, this.hashedPassword);
    if (isSha256Match) return true;

    // 3. Fallback for migrated users: old system used MD5, then we bcrypt-hashed that
    const md5Hash = crypto.createHash('md5').update(candidatePassword).digest('hex');
    return await bcrypt.compare(md5Hash, this.hashedPassword);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.hashedPassword;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
