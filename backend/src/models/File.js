const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user',
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
      index: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw', 'auto'],
      default: 'raw',
    },
    mimeType: {
      type: String,
      required: true,
      index: true,
    },
    extension: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    size: {
      type: Number,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'images',
        'videos',
        'audio',
        'pdf',
        'documents',
        'spreadsheets',
        'presentations',
        'text',
        'json',
        'csv',
        'archives',
        'other',
      ],
      default: 'other',
      index: true,
    },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    duration: { type: Number, default: null },
    checksum: { type: String, default: '', index: true },
    isStarred: { type: Boolean, default: false, index: true },
    isTrashed: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    currentVersion: { type: Number, default: 1 },
    lastAccessedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for search & fast listings
fileSchema.index({ name: 'text', originalName: 'text' });
fileSchema.index({ parentFolder: 1, isTrashed: 1, ownerRole: 1 });
fileSchema.index({ isStarred: 1, isTrashed: 1 });

module.exports = mongoose.model('File', fileSchema);
