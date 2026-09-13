const express = require('express');
const { getActivities } = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getActivities);

module.exports = router;
