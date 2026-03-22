const express = require('express');
const router = express.Router();
const VisitorCount = require('../models/VisitorCount');

// GET /api/visitors - get current visitor count
router.get('/', async (req, res) => {
    try {
        let doc = await VisitorCount.findOne();
        if (!doc) {
            doc = await VisitorCount.create({ count: 0 });
        }
        res.json({ success: true, count: doc.count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get visitor count' });
    }
});

// POST /api/visitors/increment - increment visitor count
router.post('/increment', async (req, res) => {
    try {
        let doc = await VisitorCount.findOneAndUpdate(
            {},
            { $inc: { count: 1 }, lastUpdated: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true, count: doc.count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to increment visitor count' });
    }
});

module.exports = router;
