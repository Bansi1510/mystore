const mongoose = require('mongoose');
const Folder = require('../models/Folder');
const File = require('../models/File');
const { logActivity } = require('../services/activityService');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

/**
 * Helper to build breadcrumb chain from current folder up to root
 */
async function getBreadcrumbs(folderId) {
  const breadcrumbs = [];
  let currentId = folderId;

  while (currentId) {
    const folder = await Folder.findById(currentId).select('_id name parentFolder').lean();
    if (!folder) break;
    breadcrumbs.unshift({ _id: folder._id, name: folder.name });
    currentId = folder.parentFolder;
  }

  return breadcrumbs;
}

/**
 * Helper to check if destinationFolder is descendant of targetFolder
 */
async function isDescendantFolder(targetFolderId, destinationFolderId) {
  if (!destinationFolderId) return false;
  if (String(targetFolderId) === String(destinationFolderId)) return true;

  let currentId = destinationFolderId;
  while (currentId) {
    const parent = await Folder.findById(currentId).select('parentFolder').lean();
    if (!parent) break;
    if (String(parent.parentFolder) === String(targetFolderId)) return true;
    currentId = parent.parentFolder;
  }
  return false;
}

/**
 * Create a new folder
 */
async function createFolder(req, res, next) {
  try {
    const { name, parentFolder } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Folder name is required.', code: 'MISSING_NAME' });
    }

    let parentId = null;
    if (parentFolder) {
      if (!mongoose.Types.ObjectId.isValid(parentFolder)) {
        return res.status(400).json({ success: false, message: 'Invalid parent folder ID format.' });
      }
      const parentExists = await Folder.findOne({ _id: parentFolder, isTrashed: false });
      if (!parentExists) {
        return res.status(404).json({ success: false, message: 'Parent folder not found.' });
      }
      parentId = parentFolder;
    }

    // Check duplicate name in same parent
    const existing = await Folder.findOne({
      name: name.trim(),
      parentFolder: parentId,
      isTrashed: false,
    });

    let folderName = name.trim();
    if (existing) {
      folderName = `${folderName} (Copy)`;
    }

    const folder = await Folder.create({
      name: folderName,
      ownerRole: req.user.role,
      parentFolder: parentId,
    });

    await logActivity({
      action: 'CREATE_FOLDER',
      itemType: 'folder',
      itemId: folder._id,
      itemName: folder.name,
      role: req.user.role,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Folder created successfully.',
      folder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get folder contents & metadata
 */
async function getFolder(req, res, next) {
  try {
    const { folderId } = req.params;
    let targetFolderId = null;
    let currentFolder = null;

    if (folderId && folderId !== 'root') {
      if (!mongoose.Types.ObjectId.isValid(folderId)) {
        return res.status(400).json({ success: false, message: 'Invalid folder ID.' });
      }
      currentFolder = await Folder.findOne({ _id: folderId, isTrashed: false }).lean();
      if (!currentFolder) {
        return res.status(404).json({ success: false, message: 'Folder not found or in trash.', code: 'FOLDER_NOT_FOUND' });
      }
      targetFolderId = folderId;
    }

    const subfolders = await Folder.find({ parentFolder: targetFolderId, isTrashed: false })
      .sort({ name: 1 })
      .lean();

    const files = await File.find({ parentFolder: targetFolderId, isTrashed: false })
      .sort({ updatedAt: -1 })
      .lean();

    const breadcrumbs = targetFolderId ? await getBreadcrumbs(targetFolderId) : [];

    return res.status(200).json({
      success: true,
      currentFolder,
      breadcrumbs,
      subfolders,
      files,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rename folder
 */
async function renameFolder(req, res, next) {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'New folder name is required.' });
    }

    const folder = await Folder.findOne({ _id: folderId, isTrashed: false });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    folder.name = name.trim();
    await folder.save();

    await logActivity({
      action: 'RENAME_FOLDER',
      itemType: 'folder',
      itemId: folder._id,
      itemName: folder.name,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'Folder renamed.', folder });
  } catch (error) {
    next(error);
  }
}

/**
 * Move folder
 */
async function moveFolder(req, res, next) {
  try {
    const { folderId } = req.params;
    const { destinationFolderId } = req.body; // null for root

    const folder = await Folder.findOne({ _id: folderId, isTrashed: false });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    const targetParentId = destinationFolderId || null;

    if (targetParentId) {
      if (!mongoose.Types.ObjectId.isValid(targetParentId)) {
        return res.status(400).json({ success: false, message: 'Invalid destination folder ID.' });
      }
      const isInvalidMove = await isDescendantFolder(folderId, targetParentId);
      if (isInvalidMove) {
        return res.status(400).json({ success: false, message: 'Cannot move a folder into itself or a subfolder.' });
      }
    }

    folder.parentFolder = targetParentId;
    await folder.save();

    await logActivity({
      action: 'MOVE_FOLDER',
      itemType: 'folder',
      itemId: folder._id,
      itemName: folder.name,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'Folder moved successfully.', folder });
  } catch (error) {
    next(error);
  }
}

/**
 * Star / Unstar folder
 */
async function starFolder(req, res, next) {
  try {
    const { folderId } = req.params;
    const { isStarred } = req.body;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    folder.isStarred = Boolean(isStarred);
    await folder.save();

    return res.status(200).json({ success: true, message: folder.isStarred ? 'Folder starred' : 'Folder unstarred', folder });
  } catch (error) {
    next(error);
  }
}

/**
 * Soft delete folder (move to trash)
 */
async function softDeleteFolder(req, res, next) {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    // Helper recursive function to mark folder and children as trashed
    async function trashRecursive(fId) {
      await Folder.findByIdAndUpdate(fId, { isTrashed: true, deletedAt: new Date() });
      await File.updateMany({ parentFolder: fId }, { isTrashed: true, deletedAt: new Date() });

      const children = await Folder.find({ parentFolder: fId });
      for (const child of children) {
        await trashRecursive(child._id);
      }
    }

    await trashRecursive(folderId);

    await logActivity({
      action: 'DELETE_FOLDER',
      itemType: 'folder',
      itemId: folder._id,
      itemName: folder.name,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'Folder moved to trash.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Restore folder from trash
 */
async function restoreFolder(req, res, next) {
  try {
    const { folderId } = req.params;

    async function restoreRecursive(fId) {
      await Folder.findByIdAndUpdate(fId, { isTrashed: false, deletedAt: null });
      await File.updateMany({ parentFolder: fId }, { isTrashed: false, deletedAt: null });

      const children = await Folder.find({ parentFolder: fId });
      for (const child of children) {
        await restoreRecursive(child._id);
      }
    }

    await restoreRecursive(folderId);

    await logActivity({
      action: 'RESTORE_FOLDER',
      itemType: 'folder',
      itemId: folderId,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'Folder restored from trash.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Permanent delete folder
 */
async function permanentDeleteFolder(req, res, next) {
  try {
    const { folderId } = req.params;

    async function deleteRecursive(fId) {
      // Find files in folder and delete Cloudinary assets
      const files = await File.find({ parentFolder: fId });
      for (const file of files) {
        try {
          if (file.cloudinaryPublicId) {
            await deleteFromCloudinary(file.cloudinaryPublicId, file.resourceType);
          }
        } catch (e) {
          console.warn(`Failed Cloudinary cleanup for file ${file._id}:`, e.message);
        }
        await File.findByIdAndDelete(file._id);
      }

      const children = await Folder.find({ parentFolder: fId });
      for (const child of children) {
        await deleteRecursive(child._id);
      }

      await Folder.findByIdAndDelete(fId);
    }

    await deleteRecursive(folderId);

    await logActivity({
      action: 'PERMANENT_DELETE_FOLDER',
      itemType: 'folder',
      itemId: folderId,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'Folder permanently deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFolder,
  getFolder,
  renameFolder,
  moveFolder,
  starFolder,
  softDeleteFolder,
  restoreFolder,
  permanentDeleteFolder,
};
