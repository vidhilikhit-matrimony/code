const mongoose = require('mongoose');

const siteStatSchema = new mongoose.Schema({
    identifier: {
        type: String,
        default: 'global_stats',
        unique: true
    },
    totalVisits: {
        type: Number,
        default: 15000 // Base organic initialization count as previously mocked
    }
}, {
    timestamps: true
});

const SiteStat = mongoose.model('SiteStat', siteStatSchema);

module.exports = SiteStat;
