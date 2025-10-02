const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { sendMessage, getMessages, getMessage, updateMessage, deleteMessage } = require('../controllers/contact.controller');
const router = express.Router();

// Public route - send message
router.post('/send', sendMessage);

// Protected routes - require authentication
router.use(protect);

// Admin routes for message management
router.get('/', getMessages);
router.get('/:id', getMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

module.exports = router;