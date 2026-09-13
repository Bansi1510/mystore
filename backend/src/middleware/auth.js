const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

function authenticate(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.',
      code: 'UNAUTHORIZED',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
      code: 'INVALID_TOKEN',
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privilege required.',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
};
