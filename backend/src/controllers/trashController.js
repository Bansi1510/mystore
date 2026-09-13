const File = require('../models/File');
const Folder = require('../models/Folder');
const FileVersion = require('../models/FileVersion');
const { deleteFromCloudinary } = require('../services/cloudinaryService');
const { logActivity } = require('../services/activityService');
const { isDbConnected } = require('../config/db');

async function getTrashItems(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, files: [], folders: [] });
    }

    const files = await File.find({ isTrashed: true }).sort({ deletedAt: -1 }).lean();
    const folders = await Folder.find({ isTrashed: true }).sort({ deletedAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      files,
      folders,
    });
  } catch (error) {
    next(error);
  }
}

async function emptyTrash(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database disconnected.' });
    }

    const trashedFiles = await File.find({ isTrashed: true });

    for (const file of trashedFiles) {
      try {
        if (file.cloudinaryPublicId) {
          await deleteFromCloudinary(file.cloudinaryPublicId, file.resourceType);
        }
      } catch (err) {
        console.warn(`Failed Cloudinary cleanup for trashed file ${file._id}: ${err.message}`);
      }
      await FileVersion.deleteMany({ fileId: file._id });
    }

    await File.deleteMany({ isTrashed: true });
    await Folder.deleteMany({ isTrashed: true });

    await logActivity({
      action: 'EMPTY_TRASH',
      itemType: 'system',
      role: req.user.role,
      req,
      details: { deletedFileCount: trashedFiles.length },
    });

    return res.status(200).json({
      success: true,
      message: 'Trash emptied successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTrashItems,
  emptyTrash,
};
