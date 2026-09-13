const File = require('../models/File');
const Folder = require('../models/Folder');
const Activity = require('../models/Activity');
const SystemSetting = require('../models/SystemSetting');
const { config } = require('../config/env');
const { isDbConnected } = require('../config/db');
const { isCloudinaryConfigured } = require('../config/cloudinary');

async function getAdminDashboard(req, res, next) {
  try {
    const totalLimitBytes = config.totalStorageLimitGb * 1024 * 1024 * 1024;

    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        stats: {
          totalFiles: 0,
          totalFolders: 0,
          trashedFilesCount: 0,
          trashedFoldersCount: 0,
          uploadsCount: 0,
          downloadsCount: 0,
          usedStorageBytes: 0,
          trashStorageBytes: 0,
          totalLimitBytes,
          availableStorageBytes: totalLimitBytes,
        },
        categoryDistribution: [],
        recentActivities: [],
        systemHealth: {
          database: 'disconnected',
          cloudinary: isCloudinaryConfigured() ? 'configured' : 'not_configured',
          environment: config.nodeEnv,
        },
      });
    }

    const [totalFiles, totalFolders, trashedFilesCount, trashedFoldersCount, uploadsCount, downloadsCount] =
      await Promise.all([
        File.countDocuments({ isTrashed: false }),
        Folder.countDocuments({ isTrashed: false }),
        File.countDocuments({ isTrashed: true }),
        Folder.countDocuments({ isTrashed: true }),
        Activity.countDocuments({ action: 'UPLOAD' }),
        Activity.countDocuments({ action: 'DOWNLOAD' }),
      ]);

    const storageAggregate = await File.aggregate([
      {
        $group: {
          _id: '$isTrashed',
          totalSize: { $sum: '$size' },
        },
      },
    ]);

    let usedStorageBytes = 0;
    let trashStorageBytes = 0;

    storageAggregate.forEach((item) => {
      if (item._id) trashStorageBytes += item.totalSize;
      else usedStorageBytes += item.totalSize;
    });

    const categoryDistribution = await File.aggregate([
      { $match: { isTrashed: false } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalBytes: { $sum: '$size' } } },
    ]);

    const recentActivities = await Activity.find().sort({ createdAt: -1 }).limit(10).lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalFiles,
        totalFolders,
        trashedFilesCount,
        trashedFoldersCount,
        uploadsCount,
        downloadsCount,
        usedStorageBytes,
        trashStorageBytes,
        totalLimitBytes,
        availableStorageBytes: Math.max(0, totalLimitBytes - usedStorageBytes),
      },
      categoryDistribution,
      recentActivities,
      systemHealth: {
        database: isDbConnected() ? 'connected' : 'disconnected',
        cloudinary: isCloudinaryConfigured() ? 'configured' : 'not_configured',
        environment: config.nodeEnv,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getAllFilesAdmin(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        files: [],
        pagination: { page: 1, limit: 50, total: 0 },
      });
    }

    const { search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (search) {
      query.filename = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [files, total] = await Promise.all([
      File.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
      File.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      files,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminSettings(req, res, next) {
  try {
    let settingsMap = {};
    if (isDbConnected()) {
      const settings = await SystemSetting.find().lean();
      settings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
    }

    return res.status(200).json({
      success: true,
      settings: {
        maxFileSizeMb: settingsMap.maxFileSizeMb || config.maxFileSizeMb,
        totalStorageLimitGb: settingsMap.totalStorageLimitGb || config.totalStorageLimitGb,
        defaultShareExpirationDays: settingsMap.defaultShareExpirationDays || 7,
        trashRetentionDays: settingsMap.trashRetentionDays || 30,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminSettings(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Settings cannot be persisted.',
      });
    }

    const { maxFileSizeMb, totalStorageLimitGb, defaultShareExpirationDays, trashRetentionDays } = req.body;

    const updates = [];
    if (maxFileSizeMb !== undefined) {
      updates.push(
        SystemSetting.findOneAndUpdate(
          { key: 'maxFileSizeMb' },
          { value: Number(maxFileSizeMb), updatedByRole: 'admin' },
          { upsert: true }
        )
      );
    }

    if (totalStorageLimitGb !== undefined) {
      updates.push(
        SystemSetting.findOneAndUpdate(
          { key: 'totalStorageLimitGb' },
          { value: Number(totalStorageLimitGb), updatedByRole: 'admin' },
          { upsert: true }
        )
      );
    }

    if (defaultShareExpirationDays !== undefined) {
      updates.push(
        SystemSetting.findOneAndUpdate(
          { key: 'defaultShareExpirationDays' },
          { value: Number(defaultShareExpirationDays), updatedByRole: 'admin' },
          { upsert: true }
        )
      );
    }

    if (trashRetentionDays !== undefined) {
      updates.push(
        SystemSetting.findOneAndUpdate(
          { key: 'trashRetentionDays' },
          { value: Number(trashRetentionDays), updatedByRole: 'admin' },
          { upsert: true }
        )
      );
    }

    await Promise.all(updates);

    return res.status(200).json({ success: true, message: 'System settings updated successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminDashboard,
  getAllFilesAdmin,
  getAdminSettings,
  updateAdminSettings,
};
