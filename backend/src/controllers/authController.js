const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const { logActivity } = require('../services/activityService');

async function login(req, res, next) {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
        code: 'MISSING_PASSWORD',
      });
    }

    let role = null;

    // Check normal user hash
    if (config.normalUserHash) {
      const isNormalUser = await bcrypt.compare(password, config.normalUserHash);
      if (isNormalUser) {
        role = 'user';
      }
    }

    // Check admin user hash if not normal user
    if (!role && config.adminHash) {
      const isAdminUser = await bcrypt.compare(password, config.adminHash);
      if (isAdminUser) {
        role = 'admin';
      }
    }

    if (!role) {
      await logActivity({
        action: 'LOGIN_FAILED',
        itemType: 'auth',
        role: 'anonymous',
        req,
        details: { message: 'Invalid password attempt' },
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Sign JWT token
    const token = jwt.sign({ role }, config.jwtSecret, {
      expiresIn: '7d',
    });

    // Set HTTP-only Cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await logActivity({
      action: 'LOGIN',
      itemType: 'auth',
      role,
      req,
      details: { role },
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        role,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const role = req.user ? req.user.role : 'anonymous';
    res.clearCookie('auth_token');

    await logActivity({
      action: 'LOGOUT',
      itemType: 'auth',
      role,
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: {
      role: req.user.role,
    },
  });
}

module.exports = {
  login,
  logout,
  getCurrentUser,
};
