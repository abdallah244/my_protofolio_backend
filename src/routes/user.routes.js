const express = require('express');
const {
    getProfile,
    updateProfile,
    deleteProfile
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

// جميع Routes التالية تحتاج مصادقة
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', updateProfile);

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
router.delete('/profile', deleteProfile);

module.exports = router;