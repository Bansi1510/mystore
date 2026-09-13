const express = require('express');
const { isDbConnected } = require('../config/db');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const { config } = require('../config/env');

const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    server: 'ok',
    database: isDbConnected() ? 'connected' : 'disconnected',
    cloudinary: isCloudinaryConfigured() ? 'configured' : 'not_configured',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
