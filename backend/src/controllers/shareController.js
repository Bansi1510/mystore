const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ShareLink = require('../models/ShareLink');
const File = require('../models/File');
const Folder = require('../models/Folder');
const FileRequest = require('../models/FileRequest');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { getFileCategory, calculateChecksum } = require('../utils/helper');
const { logActivity } = require('../services/activityService');

/**
 * Create share link
 */
async function createShareLink(req, res, next) {
  try {
    const { targetType, targetId, password, expiresAt, allowDownload = true, allowPreview = true } = req.body;

    if (!targetType || !['file', 'folder'].includes(targetType) || !targetId) {
      return res.status(400).json({ success: false, message: 'Target type (file/folder) and target ID required.' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    let passwordHash = null;
    if (password && password.trim() !== '') {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const share = await ShareLink.create({
      token,
      targetType,
      targetId,
      targetRef: targetType === 'file' ? 'File' : 'Folder',
      passwordHash,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      allowDownload: Boolean(allowDownload),
      allowPreview: Boolean(allowPreview),
      createdByRole: req.user.role,
    });

    await logActivity({
      action: 'CREATE_SHARE',
      itemType: 'share',
      itemId: share._id,
      role: req.user.role,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Share link created.',
      shareToken: token,
      shareUrl: `${req.protocol}://${req.get('host')}/share/${token}`,
      share,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get active user shares
 */
async function getMyShares(req, res, next) {
  try {
    const shares = await ShareLink.find().populate('targetId').sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, shares });
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke share link
 */
async function revokeShareLink(req, res, next) {
  try {
    const { token } = req.params;
    const share = await ShareLink.findOneAndDelete({ token });
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found.' });
    }

    await logActivity({
      action: 'REVOKE_SHARE',
      itemType: 'share',
      itemId: share._id,
      role: req.user.role,
      req,
    });

    return res.status(200).json({ success: true, message: 'Share link revoked.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Share Endpoint
 */
async function getPublicShare(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.query;

    const share = await ShareLink.findOne({ token }).populate('targetId').lean();
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found or expired.', code: 'SHARE_NOT_FOUND' });
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, message: 'Share link has expired.', code: 'SHARE_EXPIRED' });
    }

    // Password check
    if (share.passwordHash) {
      if (!password) {
        return res.status(401).json({ success: false, requiresPassword: true, message: 'Password required to access this share.' });
      }
      const match = await bcrypt.compare(password, share.passwordHash);
      if (!match) {
        return res.status(401).json({ success: false, requiresPassword: true, message: 'Incorrect password.' });
      }
    }

    await ShareLink.updateOne({ token }, { $inc: { viewsCount: 1 } });

    let targetData = null;
    let folderContents = null;

    if (share.targetType === 'file') {
      targetData = await File.findById(share.targetId).lean();
    } else {
      targetData = await Folder.findById(share.targetId).lean();
      const subfolders = await Folder.find({ parentFolder: share.targetId, isTrashed: false }).lean();
      const files = await File.find({ parentFolder: share.targetId, isTrashed: false }).lean();
      folderContents = { subfolders, files };
    }

    return res.status(200).json({
      success: true,
      share: {
        token: share.token,
        targetType: share.targetType,
        allowDownload: share.allowDownload,
        allowPreview: share.allowPreview,
        expiresAt: share.expiresAt,
      },
      targetData,
      folderContents,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create File Request
 */
async function createFileRequest(req, res, next) {
  try {
    const { title, description, destinationFolder, maxUploads = 50, maxFileSizeMb = 100, allowedTypes = [], expiresAt } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required for file request.' });
    }

    const token = crypto.randomBytes(16).toString('hex');

    const fileReq = await FileRequest.create({
      token,
      title: title.trim(),
      description: description || '',
      destinationFolder: destinationFolder || null,
      maxUploads,
      maxFileSizeMb,
      allowedTypes,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdByRole: req.user.role,
    });

    await logActivity({
      action: 'CREATE_FILE_REQUEST',
      itemType: 'request',
      itemId: fileReq._id,
      itemName: fileReq.title,
      role: req.user.role,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'File request created.',
      token,
      fileRequest: fileReq,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Public File Request Metadata
 */
async function getPublicFileRequest(req, res, next) {
  try {
    const { token } = req.params;
    const request = await FileRequest.findOne({ token, isActive: true }).lean();

    if (!request) {
      return res.status(404).json({ success: false, message: 'File request link not found or inactive.' });
    }

    if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, message: 'This file request has expired.' });
    }

    if (request.maxUploads && request.currentUploadsCount >= request.maxUploads) {
      return res.status(410).json({ success: false, message: 'Maximum upload limit reached for this file request.' });
    }

    return res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload to Public File Request
 */
async function uploadToPublicRequest(req, res, next) {
  try {
    const { token } = req.params;
    const request = await FileRequest.findOne({ token, isActive: true });

    if (!request) {
      return res.status(404).json({ success: false, message: 'File request not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
    const category = getFileCategory(req.file.mimetype, req.file.originalname);
    const checksum = calculateChecksum(req.file.buffer);

    const fileDoc = await File.create({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      ownerRole: request.createdByRole,
      parentFolder: request.destinationFolder,
      cloudinaryPublicId: cloudResult.publicId,
      cloudinaryUrl: cloudResult.url,
      resourceType: cloudResult.resourceType,
      mimeType: req.file.mimetype,
      extension: req.file.originalname.substring(req.file.originalname.lastIndexOf('.')).toLowerCase() || '',
      size: req.file.size,
      category,
      width: cloudResult.width,
      height: cloudResult.height,
      duration: cloudResult.duration,
      checksum,
    });

    request.currentUploadsCount += 1;
    await request.save();

    await logActivity({
      action: 'PUBLIC_REQUEST_UPLOAD',
      itemType: 'file',
      itemId: fileDoc._id,
      itemName: fileDoc.filename,
      role: 'anonymous',
      req,
    });

    return res.status(201).json({ success: true, message: 'File uploaded successfully.', file: fileDoc });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createShareLink,
  getMyShares,
  revokeShareLink,
  getPublicShare,
  createFileRequest,
  getPublicFileRequest,
  uploadToPublicRequest,
};
