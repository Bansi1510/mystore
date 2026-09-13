const mongoose = require('mongoose');

const fileVersionSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    checksum: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

fileVersionSchema.index({ fileId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model('FileVersion', fileVersionSchema);
