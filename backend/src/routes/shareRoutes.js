const express = require('express');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const {
  createShareLink,
  getMyShares,
  revokeShareLink,
  getPublicShare,
  createFileRequest,
  getPublicFileRequest,
  uploadToPublicRequest,
} = require('../controllers/shareController');

const router = express.Router();

// Public routes (no auth needed)
router.get('/public/:token', getPublicShare);
router.get('/request/:token', getPublicFileRequest);
router.post('/request/:token/upload', upload.single('file'), uploadToPublicRequest);

// Protected routes (requires user or admin)
router.use(authenticate);
router.post('/', createShareLink);
router.get('/my-shares', getMyShares);
router.delete('/:token', revokeShareLink);
router.post('/request', createFileRequest);

module.exports = router;
