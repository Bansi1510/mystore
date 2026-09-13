const File = require('../models/File');
const { config } = require('../config/env');
const { isDbConnected } = require('../config/db');

async function getStorageStats(req, res, next) {
  try {
    const totalLimitBytes = config.totalStorageLimitGb * 1024 * 1024 * 1024;

    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        storage: {
          totalLimitGb: config.totalStorageLimitGb,
          totalLimitBytes,
          usedBytes: 0,
          availableBytes: totalLimitBytes,
          trashBytes: 0,
          usedPercentage: 0,
          categoryBreakdown: {
            images: 0,
            videos: 0,
            audio: 0,
            pdf: 0,
            documents: 0,
            spreadsheets: 0,
            presentations: 0,
            text: 0,
            json: 0,
            csv: 0,
            archives: 0,
            other: 0,
          },
        },
        largestFiles: [],
        recentUploads: [],
      });
    }

    const stats = await File.aggregate([
      {
        $group: {
          _id: {
            isTrashed: '$isTrashed',
            category: '$category',
          },
          totalSize: { $sum: '$size' },
          count: { $sum: 1 },
        },
      },
    ]);

    let usedBytes = 0;
    let trashBytes = 0;
    const categoryBreakdown = {
      images: 0,
      videos: 0,
      audio: 0,
      pdf: 0,
      documents: 0,
      spreadsheets: 0,
      presentations: 0,
      text: 0,
      json: 0,
      csv: 0,
      archives: 0,
      other: 0,
    };

    stats.forEach((item) => {
      if (item._id.isTrashed) {
        trashBytes += item.totalSize;
      } else {
        usedBytes += item.totalSize;
        const cat = item._id.category || 'other';
        if (categoryBreakdown[cat] !== undefined) {
          categoryBreakdown[cat] += item.totalSize;
        } else {
          categoryBreakdown.other += item.totalSize;
        }
      }
    });

    const largestFiles = await File.find({ isTrashed: false })
      .sort({ size: -1 })
      .limit(10)
      .select('filename originalName size category mimeType extension createdAt')
      .lean();

    const recentUploads = await File.find({ isTrashed: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('filename originalName size category mimeType extension createdAt')
      .lean();

    return res.status(200).json({
      success: true,
      storage: {
        totalLimitGb: config.totalStorageLimitGb,
        totalLimitBytes,
        usedBytes,
        availableBytes: Math.max(0, totalLimitBytes - usedBytes),
        trashBytes,
        usedPercentage: Math.min(100, Number(((usedBytes / totalLimitBytes) * 100).toFixed(2))),
        categoryBreakdown,
      },
      largestFiles,
      recentUploads,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStorageStats,
};
