const { SiteStat } = require('../models');

/**
 * Handle and record a new unique site visit
 * POST /api/stats/visit
 */
exports.recordVisit = async (req, res, next) => {
    try {
        // Upsert the single global stats document
        const stat = await SiteStat.findOneAndUpdate(
            { identifier: 'global_stats' },
            { $inc: { totalVisits: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            data: stat.totalVisits
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get the current total visits count
 * GET /api/stats/visits
 */
exports.getVisits = async (req, res, next) => {
    try {
        let stat = await SiteStat.findOne({ identifier: 'global_stats' });

        // If it doesn't exist yet, return the default initialization count
        if (!stat) {
            stat = await SiteStat.create({ identifier: 'global_stats' });
        }

        res.json({
            success: true,
            data: stat.totalVisits
        });
    } catch (error) {
        next(error);
    }
};
