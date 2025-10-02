const { upload } = require('../config/cloudinary');
const { sendError } = require('../utils/response');

// Middleware for single image upload
const uploadImage = upload.single('image');

// Middleware for multiple images upload (max 5 images)
const uploadImages = upload.array('images', 5);

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return sendError(res, 'File too large. Maximum size is 2MB', 400);
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return sendError(res, 'Too many files. Maximum is 5 files', 400);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return sendError(res, 'Unexpected field name for file upload', 400);
        }
    }
    
    // Other errors
    if (err) {
        return sendError(res, err.message, 400);
    }
    
    next();
};

module.exports = {
    uploadImage,
    uploadImages,
    handleUploadError
};