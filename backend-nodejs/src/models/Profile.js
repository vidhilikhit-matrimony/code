const mongoose = require('mongoose');

const maritalStatusEnum = ['unmarried', 'divorced', 'widow', 'widower'];

const profilePhotoSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    profileCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 100
    },
    height: {
        type: String,
        trim: true
    },
    birthPlace: {
        type: String,
        trim: true,
        required: [true, 'Birthplace is required']
    },
    caste: {
        type: String,
        trim: true
    },
    subCaste: {
        type: String,
        trim: true
    },
    gotra: {
        type: String,
        trim: true
    },
    rashi: {
        type: String,
        trim: true
    },
    nakshatra: {
        type: String,
        trim: true
    },
    nadi: {
        type: String,
        trim: true
    },
    timeOfBirth: {
        type: String,  // Store as HH:MM format
        trim: true
    },
    education: {
        type: String,
        trim: true
    },
    occupation: {
        type: String,
        trim: true
    },
    annualIncome: {
        type: String,
        trim: true
    },
    assets: {
        type: String,  // Text description of assets
        trim: true
    },
    currentLocation: {
        type: String,
        trim: true
    },
    workingPlace: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    maritalStatus: {
        type: String,
        enum: maritalStatusEnum,
        lowercase: true
    },
    fatherName: {
        type: String,
        trim: true
    },
    fatherOccupation: {
        type: String,
        trim: true
    },
    motherName: {
        type: String,
        trim: true
    },
    motherOccupation: {
        type: String,
        trim: true
    },
    profileFor: {
        type: String,
        trim: true
    },
    brother: {
        type: String,
        trim: true
    },
    sister: {
        type: String,
        trim: true
    },
    sendersInfo: {
        type: String,
        trim: true
    },
    postalAddress: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    expectations: {
        type: String,
        trim: true
    },
    photos: [profilePhotoSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true  // For filtering published profiles
    },
    isUnlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true  // createdAt, updatedAt
});

// Index for efficient queries
profileSchema.index({ userId: 1, isPublished: 1 });
profileSchema.index({ isPublished: 1, isActive: 1 });

// Generate profile code before saving (if not provided)
profileSchema.pre('save', async function (next) {
    if (!this.profileCode) {
        // Generate unique profile code (e.g., VL202601001)
        const prefix = 'VL';
        const year = new Date().getFullYear().toString().slice(-2);
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Profile').countDocuments();
        const sequence = String(count + 1).padStart(3, '0');
        this.profileCode = `${prefix}${year}${month}${sequence}`;
    }
    next();
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
