const multer = require('multer');
const { config } = require('../config/env');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Reject executable or dangerous extensions if desired, but allow standard media/docs
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs'];
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();

  if (dangerousExtensions.includes(ext)) {
    return cb(new Error(`File type ${ext} is restricted for security reasons.`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024, // MB to bytes
  },
  fileFilter,
});

module.exports = upload;
