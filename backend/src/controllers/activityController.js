const Activity = require('../models/Activity');

async function getActivities(req, res, next) {
  try {
    const { action, role, itemType, page = 1, limit = 50 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (role) query.role = role;
    if (itemType) query.itemType = itemType;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [activities, total] = await Promise.all([
      Activity.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
      Activity.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      activities,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getActivities,
};
