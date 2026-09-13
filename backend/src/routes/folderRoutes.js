const express = require('express');
const {
  createFolder,
  getFolder,
  renameFolder,
  moveFolder,
  starFolder,
  softDeleteFolder,
  restoreFolder,
  permanentDeleteFolder,
} = require('../controllers/folderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', createFolder);
router.get('/', (req, res, next) => getFolder(req, res, next));
router.get('/:folderId', getFolder);
router.patch('/:folderId/rename', renameFolder);
router.patch('/:folderId/move', moveFolder);
router.patch('/:folderId/star', starFolder);
router.delete('/:folderId', softDeleteFolder);
router.patch('/:folderId/restore', restoreFolder);
router.delete('/:folderId/permanent', permanentDeleteFolder);

module.exports = router;
