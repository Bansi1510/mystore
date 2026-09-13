const express = require('express');
const { search } = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, search);

module.exports = router;
