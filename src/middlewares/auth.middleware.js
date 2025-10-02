const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError, sendUnauthorizedError } = require("../utils/response");

// Middleware to protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return sendUnauthorizedError(res, "Not authorized to access this route. No token provided.");
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (decoded.id) and attach to request object
      // Exclude the password field from the user data
      req.user = await User.findById(decoded.id).select("-password");

      // Check if user still exists
      if (!req.user) {
        return sendUnauthorizedError(res, "The user belonging to this token no longer exists.");
      }

      // Check if user is active
      if (!req.user.isActive) {
        return sendUnauthorizedError(res, "This user account has been deactivated.");
      }

      next(); // Continue to the next middleware/route handler
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendUnauthorizedError(res, "Token expired. Please login again.");
      }
      if (error.name === 'JsonWebTokenError') {
        return sendUnauthorizedError(res, "Invalid token. Please login again.");
      }
      return sendUnauthorizedError(res, "Not authorized. Invalid token.");
    }
  } catch (error) {
    sendError(res, "Authentication error", 500, error);
  }
};

// Middleware to authorize based on user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user role is included in the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return sendForbiddenError(
        res,
        `User role '${req.user?.role}' is not authorized to access this route.`
      );
    }
    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendForbiddenError(res, "Admin access required.");
  }
  next();
};

module.exports = {
  protect,
  authorize,
  requireAdmin
};