const express = require('express');
const { getStorageStats } = require('../controllers/storageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getStorageStats);

module.exports = router;
