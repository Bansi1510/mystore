const express = require('express');
const { getTrashItems, emptyTrash } = require('../controllers/trashController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getTrashItems);
router.delete('/empty', emptyTrash);

module.exports = router;
