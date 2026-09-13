const express = require('express');
const {
  getAdminDashboard,
  getAllFilesAdmin,
  getAdminSettings,
  updateAdminSettings,
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Guard ALL admin routes with authenticate AND requireAdmin
router.use(authenticate, requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/files', getAllFilesAdmin);
router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);

module.exports = router;
