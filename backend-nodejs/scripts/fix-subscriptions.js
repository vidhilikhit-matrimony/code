require('dotenv').config();
const mongoose = require('mongoose');
require('../src/models');

async function fixSubscriptions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vidhilikhit');
        console.log('Connected to DB');

        const Subscription = mongoose.model('Subscription');
        const now = new Date();

        const res = await Subscription.updateMany({
            remainingViews: { $gt: 0 },
            validTo: { $gte: now },
            status: { $ne: 'active' }
        }, {
            $set: { status: 'active' }
        });

        console.log('Fixed subscriptions:', res.modifiedCount);
    } catch (error) {
        console.error('Error fixing subscriptions:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixSubscriptions();
