const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError, sendValidationError } = require("../utils/response");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });
};

// Create admin user automatically on server start
const createAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@quantumdev.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        const adminName = process.env.ADMIN_NAME || "Quantum Admin";

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("✅ Admin user already exists");
            return;
        }

        const adminUser = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: "admin",
        });

        console.log("✅ Admin user created automatically");
        console.log(`📧 Email: ${adminEmail}`);
        console.log("⚠️ Change password after first login!");
    } catch (error) {
        console.error("❌ Error creating admin user:", error.message);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password) {
            return sendError(res, "Please provide name, email and password", 400);
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return sendError(res, "User already exists with this email", 400);
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: role || "user",
        });

        // Generate token
        const token = generateToken(user._id);

        // Send response with user data and token
        sendSuccess(
            res,
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            },
            "User registered successfully",
            201
        );
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendValidationError(res, messages);
        }
        sendError(res, "Server error during registration", 500, error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return sendError(res, "Please provide email and password", 400);
        }

        // Check if user exists and password is correct
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return sendError(res, "Invalid email or password", 401);
        }

        // Check password
        const isPasswordCorrect = await user.correctPassword(password, user.password);
        if (!isPasswordCorrect) {
            return sendError(res, "Invalid email or password", 401);
        }

        // Check if user is active
        if (!user.isActive) {
            return sendError(res, "This account has been deactivated", 401);
        }

        // Generate token
        const token = generateToken(user._id);

        // Send response with user data and token
        sendSuccess(
            res,
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            },
            "User logged in successfully"
        );
    } catch (error) {
        sendError(res, "Server error during login", 500, error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
    // Since we're using JWT in client-side storage, logout is handled client-side by removing the token.
    // This endpoint can be used for token blacklisting in the future if needed.
    sendSuccess(res, null, "User logged out successfully");
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        sendSuccess(res, {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }, "User profile retrieved successfully");
    } catch (error) {
        sendError(res, "Error retrieving user profile", 500, error);
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    createAdminUser,
};