const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
const File = require('../models/File');
const Folder = require('../models/Folder');
const FileVersion = require('../models/FileVersion');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { logActivity } = require('../services/activityService');
const { getFileCategory, calculateChecksum } = require('../utils/helper');
const { streamZipArchive } = require('../services/zipService');

/**
 * Stream file content from remote cloud URL directly to HTTP response
 */
function streamFromUrl(url, res, options = {}) {
  const protocol = url.startsWith('https') ? https : http;

  protocol.get(url, (cloudRes) => {
    if (cloudRes.statusCode >= 400) {
      if (!res.headersSent) {
        return res.status(cloudRes.statusCode).json({
          success: false,
          message: 'Failed to retrieve file from cloud storage.',
        });
      }
      return;
    }

    if (options.contentType) {
      res.setHeader('Content-Type', options.contentType);
    } else if (cloudRes.headers['content-type']) {
      res.setHeader('Content-Type', cloudRes.headers['content-type']);
    }

    if (options.contentDisposition) {
      res.setHeader('Content-Disposition', options.contentDisposition);
    }

    if (cloudRes.headers['content-length']) {
      res.setHeader('Content-Length', cloudRes.headers['content-length']);
    }

    cloudRes.pipe(res);
  }).on('error', (err) => {
    console.error('Error streaming file from Cloudinary:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'File stream error.' });
    }
  });
}


/**
 * Single file upload
 */
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.', code: 'NO_FILE' });
    }

    const { parentFolder } = req.body;
    let parentId = null;

    if (parentFolder && parentFolder !== 'null' && parentFolder !== 'root') {
      if (!mongoose.Types.ObjectId.isValid(parentFolder)) {
        return res.status(400).json({ success: false, message: 'Invalid parent folder ID.' });
      }
      const folderExists = await Folder.findOne({ _id: parentFolder, isTrashed: false });
      if (!folderExists) {
        return res.status(404).json({ success: false, message: 'Parent folder not found.' });
      }
      parentId = parentFolder;
    }

    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const size = req.file.size;
    const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase() || '';
    const category = getFileCategory(mimeType, originalName);
    const checksum = calculateChecksum(req.file.buffer);

    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(
      req.file.buffer,
      originalName,
      mimeType,
      'cloud_drive'
    );

    // Handle collision in same folder
    let filename = originalName;
    const existing = await File.findOne({ filename, parentFolder: parentId, isTrashed: false });
    if (existing) {
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      filename = `${baseName} (1)${ext}`;
    }

    const fileDoc = await File.create({
      filename,
      originalName,
      ownerRole: req.user.role,
      parentFolder: parentId,
      cloudinaryPublicId: cloudResult.publicId,
      cloudinaryUrl: cloudResult.url,
      resourceType: cloudResult.resourceType,
      mimeType,
      extension: ext,
      size,
      category,
      width: cloudResult.width,
      height: cloudResult.height,
      duration: cloudResult.duration,
      checksum,
    });

    await logActivity({
      action: 'UPLOAD',
      itemType: 'file',
      itemId: fileDoc._id,
      itemName: fileDoc.filename,
      role: req.user.role,
      req,
      details: { size, category, mimeType },
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      file: fileDoc,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Multiple files upload
 */
async function uploadMultipleFiles(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    const { parentFolder } = req.body;
    let parentId = null;
    if (parentFolder && parentFolder !== 'null' && parentFolder !== 'root') {
      if (mongoose.Types.ObjectId.isValid(parentFolder)) {
        parentId = parentFolder;
      }
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const originalName = file.originalname;
      const mimeType = file.mimetype;
      const size = file.size;
      const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase() || '';
      const category = getFileCategory(mimeType, originalName);
      const checksum = calculateChecksum(file.buffer);

      const cloudResult = await uploadToCloudinary(file.buffer, originalName, mimeType, 'cloud_drive');

      let filename = originalName;
      const existing = await File.findOne({ filename, parentFolder: parentId, isTrashed: false });
      if (existing) {
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        filename = `${baseName} (${Date.now()})${ext}`;
      }

      const fileDoc = await File.create({
        filename,
        originalName,
        ownerRole: req.user.role,
        parentFolder: parentId,
        cloudinaryPublicId: cloudResult.publicId,
        cloudinaryUrl: cloudResult.url,
        resourceType: cloudResult.resourceType,
        mimeType,
        extension: ext,
        size,
        category,
        width: cloudResult.width,
        height: cloudResult.height,
        duration: cloudResult.duration,
        checksum,
      });

      uploadedFiles.push(fileDoc);
    }

    await logActivity({
      action: 'UPLOAD_MULTIPLE',
      itemType: 'file',
      role: req.user.role,
      req,
      details: { count: uploadedFiles.length },
    });

    return res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully.`,
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get file details & record access
 */
async function getFileDetails(req, res, next) {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId).lean();
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    await File.findByIdAndUpdate(fileId, { lastAccessedAt: new Date() });

    await logActivity({
      action: 'PREVIEW',
      itemType: 'file',
      itemId: file._id,
      itemName: file.filename,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, file });
  } catch (error) {
    next(error);
  }
}

/**
 * Download file (Forces browser download with original filename)
 */
async function downloadFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    await logActivity({
      action: 'DOWNLOAD',
      itemType: 'file',
      itemId: file._id,
      itemName: file.filename,
      role: req.user ? req.user.role : 'public',
      req,
    });

    const safeFilename = encodeURIComponent(file.filename);
    const contentDisposition = `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`;

    return streamFromUrl(file.cloudinaryUrl, res, {
      contentType: file.mimeType || 'application/octet-stream',
      contentDisposition,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * View / Stream file inline for browser preview
 */
async function viewFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    const safeFilename = encodeURIComponent(file.filename);
    const contentDisposition = `inline; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`;

    return streamFromUrl(file.cloudinaryUrl, res, {
      contentType: file.mimeType || 'application/octet-stream',
      contentDisposition,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rename file
 */
async function renameFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'File name is required.' });
    }

    const file = await File.findOne({ _id: fileId, isTrashed: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    file.filename = name.trim();
    await file.save();

    await logActivity({
      action: 'RENAME',
      itemType: 'file',
      itemId: file._id,
      itemName: file.filename,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'File renamed.', file });
  } catch (error) {
    next(error);
  }
}

/**
 * Move file
 */
async function moveFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const { destinationFolderId } = req.body;

    const file = await File.findOne({ _id: fileId, isTrashed: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    let targetParentId = null;
    if (destinationFolderId) {
      if (!mongoose.Types.ObjectId.isValid(destinationFolderId)) {
        return res.status(400).json({ success: false, message: 'Invalid destination folder.' });
      }
      const folderExists = await Folder.findOne({ _id: destinationFolderId, isTrashed: false });
      if (!folderExists) {
        return res.status(404).json({ success: false, message: 'Destination folder not found.' });
      }
      targetParentId = destinationFolderId;
    }

    file.parentFolder = targetParentId;
    await file.save();

    await logActivity({
      action: 'MOVE',
      itemType: 'file',
      itemId: file._id,
      itemName: file.filename,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'File moved successfully.', file });
  } catch (error) {
    next(error);
  }
}

/**
 * Copy file
 */
async function copyFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const { destinationFolderId } = req.body;

    const file = await File.findOne({ _id: fileId, isTrashed: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    let targetParentId = destinationFolderId || file.parentFolder;
    const baseName = file.filename.substring(0, file.filename.lastIndexOf('.')) || file.filename;
    const ext = file.extension;
    const newFilename = `${baseName} (Copy)${ext}`;

    const newFile = await File.create({
      filename: newFilename,
      originalName: file.originalName,
      ownerRole: req.user.role,
      parentFolder: targetParentId,
      cloudinaryPublicId: file.cloudinaryPublicId,
      cloudinaryUrl: file.cloudinaryUrl,
      resourceType: file.resourceType,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      category: file.category,
      width: file.width,
      height: file.height,
      duration: file.duration,
      checksum: file.checksum,
    });

    await logActivity({
      action: 'COPY',
      itemType: 'file',
      itemId: newFile._id,
      itemName: newFile.filename,
      role: req.user.role,
      req,
    });

    return res.status(201).json({ success: true, message: 'File copied successfully.', file: newFile });
  } catch (error) {
    next(error);
  }
}

/**
 * Star / Unstar file
 */
async function starFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const { isStarred } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    file.isStarred = Boolean(isStarred);
    await file.save();

    return res.status(200).json({ success: true, message: file.isStarred ? 'File starred' : 'File unstarred', file });
  } catch (error) {
    next(error);
  }
}

/**
 * Soft delete file
 */
async function softDeleteFile(req, res, next) {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    file.isTrashed = true;
    file.deletedAt = new Date();
    await file.save();

    await logActivity({
      action: 'DELETE',
      itemType: 'file',
      itemId: file._id,
      itemName: file.filename,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'File moved to trash.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Restore file from trash
 */
async function restoreFile(req, res, next) {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    file.isTrashed = false;
    file.deletedAt = null;
    await file.save();

    await logActivity({
      action: 'RESTORE',
      itemType: 'file',
      itemId: file._id,
      itemName: file.filename,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'File restored from trash.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Permanent delete file
 */
async function permanentDeleteFile(req, res, next) {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    // Delete from Cloudinary
    try {
      if (file.cloudinaryPublicId) {
        await deleteFromCloudinary(file.cloudinaryPublicId, file.resourceType);
      }
    } catch (err) {
      console.warn(`Failed Cloudinary asset deletion: ${err.message}`);
    }

    // Delete version records
    await FileVersion.deleteMany({ fileId: file._id });

    await File.findByIdAndDelete(file._id);

    await logActivity({
      action: 'PERMANENT_DELETE',
      itemType: 'file',
      itemId: fileId,
      itemName: file.filename,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'File permanently deleted.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload new version of file
 */
async function uploadNewVersion(req, res, next) {
  try {
    const { fileId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No new version file uploaded.' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    // Backup current version to FileVersion collection
    await FileVersion.create({
      fileId: file._id,
      versionNumber: file.currentVersion,
      cloudinaryPublicId: file.cloudinaryPublicId,
      cloudinaryUrl: file.cloudinaryUrl,
      size: file.size,
      checksum: file.checksum,
    });

    // Upload new version file to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
    const checksum = calculateChecksum(req.file.buffer);

    file.currentVersion += 1;
    file.cloudinaryPublicId = cloudResult.publicId;
    file.cloudinaryUrl = cloudResult.url;
    file.size = req.file.size;
    file.checksum = checksum;
    file.width = cloudResult.width;
    file.height = cloudResult.height;
    file.duration = cloudResult.duration;
    await file.save();

    await logActivity({
      action: 'UPLOAD_VERSION',
      itemType: 'file',
      itemId: file._id,
      itemName: file.filename,
      role: req.user.role,
      req,
      details: { newVersion: file.currentVersion },
    });

    return res.status(200).json({ success: true, message: 'New version uploaded.', file });
  } catch (error) {
    next(error);
  }
}

/**
 * Get file version history
 */
async function getFileVersions(req, res, next) {
  try {
    const { fileId } = req.params;
    const versions = await FileVersion.find({ fileId }).sort({ versionNumber: -1 }).lean();
    return res.status(200).json({ success: true, versions });
  } catch (error) {
    next(error);
  }
}

/**
 * Find duplicate files based on SHA256 checksum
 */
async function getDuplicates(req, res, next) {
  try {
    const duplicates = await File.aggregate([
      { $match: { isTrashed: false, checksum: { $ne: '' } } },
      {
        $group: {
          _id: '$checksum',
          count: { $sum: 1 },
          files: { $push: '$$ROOT' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    return res.status(200).json({ success: true, duplicates });
  } catch (error) {
    next(error);
  }
}

/**
 * Download ZIP archive of selected files/folders
 */
async function downloadZip(req, res, next) {
  try {
    const { fileIds = [], folderIds = [] } = req.body;

    let targetFiles = await File.find({ _id: { $in: fileIds }, isTrashed: false }).lean();

    if (folderIds.length > 0) {
      async function collectFolderFiles(fId) {
        const fFiles = await File.find({ parentFolder: fId, isTrashed: false }).lean();
        targetFiles.push(...fFiles);
        const subFolders = await Folder.find({ parentFolder: fId, isTrashed: false }).lean();
        for (const sf of subFolders) {
          await collectFolderFiles(sf._id);
        }
      }
      for (const fid of folderIds) {
        await collectFolderFiles(fid);
      }
    }

    if (targetFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid files selected for archive creation.' });
    }

    await streamZipArchive(targetFiles, res, `archive-${Date.now()}.zip`);
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk actions on files & folders
 */
async function bulkAction(req, res, next) {
  try {
    const { action, fileIds = [], folderIds = [], destinationFolderId = null } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, message: 'Action required.' });
    }

    switch (action) {
      case 'star':
        await File.updateMany({ _id: { $in: fileIds } }, { isStarred: true });
        await Folder.updateMany({ _id: { $in: folderIds } }, { isStarred: true });
        break;
      case 'unstar':
        await File.updateMany({ _id: { $in: fileIds } }, { isStarred: false });
        await Folder.updateMany({ _id: { $in: folderIds } }, { isStarred: false });
        break;
      case 'trash':
        await File.updateMany({ _id: { $in: fileIds } }, { isTrashed: true, deletedAt: new Date() });
        await Folder.updateMany({ _id: { $in: folderIds } }, { isTrashed: true, deletedAt: new Date() });
        break;
      case 'restore':
        await File.updateMany({ _id: { $in: fileIds } }, { isTrashed: false, deletedAt: null });
        await Folder.updateMany({ _id: { $in: folderIds } }, { isTrashed: false, deletedAt: null });
        break;
      case 'move':
        await File.updateMany({ _id: { $in: fileIds } }, { parentFolder: destinationFolderId || null });
        await Folder.updateMany({ _id: { $in: folderIds } }, { parentFolder: destinationFolderId || null });
        break;
      case 'permanent_delete':
        const filesToDelete = await File.find({ _id: { $in: fileIds } });
        for (const file of filesToDelete) {
          try {
            if (file.cloudinaryPublicId) {
              await deleteFromCloudinary(file.cloudinaryPublicId, file.resourceType);
            }
          } catch (e) {
            console.warn(`Cloudinary cleanup warn: ${e.message}`);
          }
        }
        await File.deleteMany({ _id: { $in: fileIds } });
        await Folder.deleteMany({ _id: { $in: folderIds } });
        break;
      default:
        return res.status(400).json({ success: false, message: `Unsupported action: ${action}` });
    }

    await logActivity({
      action: `BULK_${action.toUpperCase()}`,
      itemType: 'file',
      role: req.user.role,
      req,
      details: { fileCount: fileIds.length, folderCount: folderIds.length },
    });

    return res.status(200).json({ success: true, message: `Bulk ${action} completed successfully.` });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  getFileDetails,
  downloadFile,
  viewFile,
  renameFile,
  moveFile,
  copyFile,
  starFile,
  softDeleteFile,
  restoreFile,
  permanentDeleteFile,
  uploadNewVersion,
  getFileVersions,
  getDuplicates,
  downloadZip,
  bulkAction,
};
