const crypto = require('crypto');

/**
 * Categorize MIME type into standardized categories
 */
function getFileCategory(mimeType, filename) {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || ext === '.pdf') return 'pdf';

  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    ['.doc', '.docx', '.odt', '.rtf'].includes(ext)
  ) {
    return 'documents';
  }

  if (
    mimeType.includes('excel') ||
    mimeType.includes('sheet') ||
    ['.xls', '.xlsx', '.ods'].includes(ext)
  ) {
    return 'spreadsheets';
  }

  if (
    mimeType.includes('powerpoint') ||
    mimeType.includes('presentation') ||
    ['.ppt', '.pptx', '.odp'].includes(ext)
  ) {
    return 'presentations';
  }

  if (mimeType === 'application/json' || ext === '.json') return 'json';
  if (mimeType === 'text/csv' || ext === '.csv') return 'csv';
  if (mimeType.startsWith('text/') || ['.txt', '.md', '.log'].includes(ext)) return 'text';

  if (
    mimeType.includes('zip') ||
    mimeType.includes('tar') ||
    mimeType.includes('rar') ||
    mimeType.includes('7z') ||
    ['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)
  ) {
    return 'archives';
  }

  return 'other';
}

/**
 * Calculate SHA-256 checksum from buffer
 */
function calculateChecksum(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

module.exports = {
  getFileCategory,
  calculateChecksum,
};
