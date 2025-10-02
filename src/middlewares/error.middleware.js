const { sendError } = require('../utils/response');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        code: err.code
    });

    // Mongoose bad ObjectId (Cast Error) - Invalid ID format
    if (err.name === 'CastError') {
        const message = 'Resource not found with the specified ID';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key error (Duplicate field value)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value: ${field} '${value}' already exists`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error (Missing required fields, etc.)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = `Validation failed: ${messages.join(', ')}`;
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = { message: 'Invalid token', statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        error = { message: 'Token expired', statusCode: 401 };
    }

    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';

    sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err : null);
};

module.exports = errorHandler;