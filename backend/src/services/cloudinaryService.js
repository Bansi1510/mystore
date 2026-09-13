const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Determine Cloudinary resource_type based on mime type
 */
function getResourceType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'video'; // Cloudinary treats audio under video resource_type
  return 'raw';
}

/**
 * Upload buffer to Cloudinary
 */
async function uploadToCloudinary(buffer, originalName, mimeType, folderPath = 'cloud_drive') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured in environment variables (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET).');
  }

  const resourceType = getResourceType(mimeType);

  const path = require('path');
  const ext = path.extname(originalName) || '';
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const customPublicId = `${baseName}_${Date.now()}${ext}`;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folderPath,
      resource_type: resourceType,
      public_id: customPublicId,
      use_filename: true,
      unique_filename: false,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(new Error(`Cloudinary upload failed: ${error.message}`));
      }
      resolve({
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format || originalName.split('.').pop(),
        resourceType: result.resource_type || resourceType,
        width: result.width || null,
        height: result.height || null,
        duration: result.duration || null,
        bytes: result.bytes,
      });
    });

    stream.end(buffer);
  });
}

/**
 * Delete file from Cloudinary
 */
async function deleteFromCloudinary(publicId, resourceType = 'raw') {
  if (!isCloudinaryConfigured()) {
    console.warn('⚠️ Cloudinary not configured; skipping remote asset deletion.');
    return { result: 'not_configured' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary deletion error for publicId ${publicId}:`, error.message);
    throw error;
  }
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getResourceType,
};
