const Notification = require('../models/Notification');
const { isDbConnected } = require('../config/db');

async function getNotifications(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, notifications: [], unreadCount: 0 });
    }

    const role = req.user.role;
    const notifications = await Notification.find({
      role: { $in: [role, 'all'] },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      role: { $in: [role, 'all'] },
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, message: 'DB disconnected' });
    }
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, message: 'DB disconnected' });
    }
    const role = req.user.role;
    await Notification.updateMany({ role: { $in: [role, 'all'] }, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
