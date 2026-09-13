const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['file', 'folder'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetRef',
    },
    targetRef: {
      type: String,
      enum: ['File', 'Folder'],
      required: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
    allowPreview: {
      type: Boolean,
      default: true,
    },
    createdByRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShareLink', shareLinkSchema);
