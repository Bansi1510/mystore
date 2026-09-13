const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    updatedByRole: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
