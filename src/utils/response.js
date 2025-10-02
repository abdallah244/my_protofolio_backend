// Utility function to send standardized API responses

/**
 * Sends a successful response with data
 * @param {object} res - Express response object
 * @param {*} data - Data to be sent in the response
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message,
        data,
        statusCode
    };
    
    res.status(statusCode).json(response);
};

/**
 * Sends an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Original error object (optional)
 */
const sendError = (res, message = 'Server Error', statusCode = 500, error = null) => {
    const response = {
        success: false,
        error: message,
        statusCode
    };

    // في development، نضيف تفاصيل الخطأ
    if (process.env.NODE_ENV === 'development' && error) {
        response.stack = error.stack;
        response.details = error.message;
    }

    res.status(statusCode).json(response);
};

/**
 * Sends a validation error response
 * @param {object} res - Express response object
 * @param {array} errors - Array of validation errors
 * @param {string} message - Optional custom message
 */
const sendValidationError = (res, errors, message = 'Validation failed') => {
    res.status(400).json({
        success: false,
        error: message,
        details: Array.isArray(errors) ? errors : [errors],
        statusCode: 400
    });
};

/**
 * Sends a not found error response
 * @param {object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
const sendNotFoundError = (res, resource = 'Resource') => {
    res.status(404).json({
        success: false,
        error: `${resource} not found`,
        statusCode: 404
    });
};

/**
 * Sends an unauthorized error response
 * @param {object} res - Express response object
 * @param {string} message - Optional custom message
 */
const sendUnauthorizedError = (res, message = 'Unauthorized access') => {
    res.status(401).json({
        success: false,
        error: message,
        statusCode: 401
    });
};

/**
 * Sends a forbidden error response
 * @param {object} res - Express response object
 * @param {string} message - Optional custom message
 */
const sendForbiddenError = (res, message = 'Access forbidden') => {
    res.status(403).json({
        success: false,
        error: message,
        statusCode: 403
    });
};

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendNotFoundError,
    sendUnauthorizedError,
    sendForbiddenError
};