const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Public endpoints to track aggregate site traffic
router.get('/visits', statsController.getVisits);
router.post('/visit', statsController.recordVisit);

module.exports = router;
