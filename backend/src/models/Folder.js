const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
    isStarred: { type: Boolean, default: false, index: true },
    isTrashed: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

folderSchema.index({ parentFolder: 1, isTrashed: 1, ownerRole: 1 });
folderSchema.index({ name: 'text' });

module.exports = mongoose.model('Folder', folderSchema);
