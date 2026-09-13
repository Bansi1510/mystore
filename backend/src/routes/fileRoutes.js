const express = require('express');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const {
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
} = require('../controllers/fileController');

const router = express.Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadFile);
router.post('/upload-multiple', upload.array('files', 20), uploadMultipleFiles);
router.get('/duplicates', getDuplicates);
router.post('/zip', downloadZip);
router.post('/bulk', bulkAction);

router.get('/:fileId', getFileDetails);
router.get('/:fileId/download', downloadFile);
router.get('/:fileId/view', viewFile);
router.patch('/:fileId/rename', renameFile);
router.patch('/:fileId/move', moveFile);
router.post('/:fileId/copy', copyFile);
router.patch('/:fileId/star', starFile);
router.delete('/:fileId', softDeleteFile);
router.patch('/:fileId/restore', restoreFile);
router.delete('/:fileId/permanent', permanentDeleteFile);

router.post('/:fileId/versions', upload.single('file'), uploadNewVersion);
router.get('/:fileId/versions', getFileVersions);

module.exports = router;
