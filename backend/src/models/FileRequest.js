const mongoose = require('mongoose');

const fileRequestSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    destinationFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    maxUploads: {
      type: Number,
      default: 50,
    },
    currentUploadsCount: {
      type: Number,
      default: 0,
    },
    maxFileSizeMb: {
      type: Number,
      default: 100,
    },
    allowedTypes: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdByRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FileRequest', fileRequestSchema);
