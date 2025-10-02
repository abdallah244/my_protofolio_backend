const { cloudinary } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Upload media to Cloudinary
// @route   POST /api/media/upload
// @access  Private
const uploadMedia = async (req, res, next) => {
    try {
        if (!req.file && !req.files) {
            return sendError(res, 'No files were uploaded', 400);
        }

        // Single file upload
        if (req.file) {
            const result = {
                url: req.file.path,
                publicId: req.file.filename,
                format: req.file.format,
                size: req.file.size
            };
            return sendSuccess(res, result, 'Image uploaded successfully');
        }

        // Multiple files upload
        if (req.files) {
            const results = req.files.map(file => ({
                url: file.path,
                publicId: file.filename,
                format: file.format,
                size: file.size
            }));
            return sendSuccess(res, results, 'Images uploaded successfully');
        }

    } catch (error) {
        next(error);
    }
};

// @desc    Delete media from Cloudinary
// @route   DELETE /api/media/:publicId
// @access  Private
const deleteMedia = async (req, res, next) => {
    try {
        const { publicId } = req.params;

        // Delete image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'not found') {
            return sendError(res, 'Image not found', 404);
        }

        sendSuccess(res, null, 'Image deleted successfully');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadMedia,
    deleteMedia
};