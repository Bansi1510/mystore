const Activity = require('../models/Activity');
const { isDbConnected } = require('../config/db');

async function logActivity({ action, itemType = 'file', itemId = null, itemName = '', role = 'user', req = null, details = {} }) {
  if (!isDbConnected()) return;

  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    await Activity.create({
      action,
      itemType,
      itemId: itemId ? String(itemId) : null,
      itemName,
      role,
      ipAddress,
      userAgent,
      details,
    });
  } catch (error) {
    console.error('❌ Failed to log activity:', error.message);
  }
}

module.exports = {
  logActivity,
};
