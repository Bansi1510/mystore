const File = require('../models/File');
const Folder = require('../models/Folder');

async function search(req, res, next) {
  try {
    const { q, category, isStarred, isTrashed, minSize, maxSize, page = 1, limit = 50 } = req.query;

    const fileQuery = {};
    const folderQuery = {};

    // Default: exclude trashed unless requested
    fileQuery.isTrashed = isTrashed === 'true';
    folderQuery.isTrashed = isTrashed === 'true';

    let searchTerm = q ? String(q).trim() : '';

    // Advanced search syntax parsing e.g. type:pdf size:>10MB name:report
    if (searchTerm) {
      const typeMatch = searchTerm.match(/type:(\w+)/i);
      const sizeMatch = searchTerm.match(/size:(>|<)?(\d+)(MB|KB|GB)?/i);
      const nameMatch = searchTerm.match(/name:([^\s]+)/i);

      if (typeMatch) {
        fileQuery.category = typeMatch[1].toLowerCase();
        searchTerm = searchTerm.replace(typeMatch[0], '').trim();
      }

      if (sizeMatch) {
        const operator = sizeMatch[1] || '>';
        const value = parseInt(sizeMatch[2], 10);
        const unit = (sizeMatch[3] || 'MB').toUpperCase();
        let bytes = value * 1024 * 1024;
        if (unit === 'KB') bytes = value * 1024;
        if (unit === 'GB') bytes = value * 1024 * 1024 * 1024;

        fileQuery.size = operator === '>' ? { $gt: bytes } : { $lt: bytes };
        searchTerm = searchTerm.replace(sizeMatch[0], '').trim();
      }

      if (nameMatch) {
        searchTerm = nameMatch[1];
      }

      if (searchTerm) {
        fileQuery.$or = [
          { filename: { $regex: searchTerm, $options: 'i' } },
          { originalName: { $regex: searchTerm, $options: 'i' } },
        ];
        folderQuery.name = { $regex: searchTerm, $options: 'i' };
      }
    }

    if (category && category !== 'all') {
      fileQuery.category = category;
    }

    if (isStarred === 'true') {
      fileQuery.isStarred = true;
      folderQuery.isStarred = true;
    }

    if (minSize || maxSize) {
      fileQuery.size = fileQuery.size || {};
      if (minSize) fileQuery.size.$gte = parseInt(minSize, 10);
      if (maxSize) fileQuery.size.$lte = parseInt(maxSize, 10);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [files, folders, totalFiles, totalFolders] = await Promise.all([
      File.find(fileQuery).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
      Folder.find(folderQuery).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
      File.countDocuments(fileQuery),
      Folder.countDocuments(folderQuery),
    ]);

    return res.status(200).json({
      success: true,
      query: q,
      files,
      folders,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalFiles,
        totalFolders,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  search,
};
