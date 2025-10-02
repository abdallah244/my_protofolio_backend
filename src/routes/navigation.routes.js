const express = require('express');
const { getNavigation } = require('../controllers/navigation.controller');
const router = express.Router();

// @desc    Get navigation menu
// @route   GET /api/navigation
// @access  Public
router.get('/', getNavigation);

module.exports = router;