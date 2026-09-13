const express = require('express');
const { login, logout, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
