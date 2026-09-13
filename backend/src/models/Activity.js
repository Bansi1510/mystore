const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['file', 'folder', 'share', 'request', 'system', 'auth'],
      default: 'file',
    },
    itemId: {
      type: String,
      default: null,
    },
    itemName: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'anonymous'],
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
