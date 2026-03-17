const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    coupleNames: {
        type: String,
        trim: true
    },
    marriageDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for ordering
successStorySchema.index({ isActive: 1, displayOrder: 1 });

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);

module.exports = SuccessStory;
