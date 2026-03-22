const mongoose = require('mongoose');

const visitorCountSchema = new mongoose.Schema({
    count: {
        type: Number,
        default: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const VisitorCount = mongoose.model('VisitorCount', visitorCountSchema);

module.exports = VisitorCount;
