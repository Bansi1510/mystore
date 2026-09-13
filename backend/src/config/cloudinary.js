const cloudinary = require('cloudinary').v2;
const { config } = require('./env');

function isCloudinaryConfigured() {
  return Boolean(
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
