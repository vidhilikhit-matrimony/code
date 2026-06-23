const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', gallerySchema);
