const express = require('express');
const { uploadImage, uploadImages, handleUploadError } = require('../middlewares/upload.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadMedia, deleteMedia } = require('../controllers/media.controller');
const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Upload single image
// @route   POST /api/media/upload
// @access  Private
router.post('/upload', uploadImage, handleUploadError, uploadMedia);

// @desc    Upload multiple images
// @route   POST /api/media/upload-multiple
// @access  Private
router.post('/upload-multiple', uploadImages, handleUploadError, uploadMedia);

// @desc    Delete image from Cloudinary
// @route   DELETE /api/media/:publicId
// @access  Private
router.delete('/:publicId', deleteMedia);

module.exports = router;