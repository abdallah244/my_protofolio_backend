const express = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public (or Private if using token blacklisting)
router.post('/logout', logout);

module.exports = router;