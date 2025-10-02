const express = require('express');
const { getPublicHomeContent } = require('../controllers/content.controller');
const router = express.Router();

// @desc    Get home page content (Public)
// @route   GET /api/content/home
// @access  Public
router.get('/home', getPublicHomeContent);

module.exports = router;