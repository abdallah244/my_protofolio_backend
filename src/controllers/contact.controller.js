const Message = require('../models/Message');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');

// @desc    Send a new message
// @route   POST /api/contact/send
// @access  Public
exports.sendMessage = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return sendError(res, 'All fields are required: name, email, subject, message', 400);
        }

        // Email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return sendError(res, 'Please provide a valid email address', 400);
        }

        // Create new message
        const newMessage = await Message.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            status: 'unread',
            isRead: false
        });

        sendSuccess(
            res,
            {
                _id: newMessage._id,
                name: newMessage.name,
                email: newMessage.email,
                subject: newMessage.subject,
                message: newMessage.message,
                status: newMessage.status,
                createdAt: newMessage.createdAt
            },
            'Message sent successfully! We will get back to you soon.',
            201
        );

    } catch (error) {
        console.error('Send message error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendValidationError(res, messages);
        }
        
        if (error.code === 11000) {
            return sendError(res, 'Message with this email and subject already exists', 400);
        }
        
        sendError(res, 'Failed to send message. Please try again.', 500, error);
    }
};

// @desc    Get all messages (Admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getMessages = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        let query = {};
        
        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const total = await Message.countDocuments(query);

        sendSuccess(res, {
            messages,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        }, 'Messages retrieved successfully');

    } catch (error) {
        console.error('Get messages error:', error);
        sendError(res, 'Failed to retrieve messages', 500, error);
    }
};

// @desc    Get single message (Admin)
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);
        
        if (!message) {
            return sendError(res, 'Message not found', 404);
        }

        // Mark as read when fetched
        if (!message.isRead) {
            message.isRead = true;
            await message.save();
        }

        sendSuccess(res, message, 'Message retrieved successfully');

    } catch (error) {
        console.error('Get message error:', error);
        
        if (error.name === 'CastError') {
            return sendError(res, 'Invalid message ID', 400);
        }
        
        sendError(res, 'Failed to retrieve message', 500, error);
    }
};

// @desc    Update message status (Admin)
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateMessage = async (req, res, next) => {
    try {
        const { status, response } = req.body;
        
        const message = await Message.findById(req.params.id);
        
        if (!message) {
            return sendError(res, 'Message not found', 404);
        }

        // Update fields
        if (status) {
            message.status = status;
            if (status === 'read' && !message.isRead) {
                message.isRead = true;
            }
        }
        
        if (response !== undefined) {
            message.response = response;
            message.respondedBy = req.user._id;
            message.respondedAt = new Date();
        }

        const updatedMessage = await message.save();

        sendSuccess(res, updatedMessage, 'Message updated successfully');

    } catch (error) {
        console.error('Update message error:', error);
        
        if (error.name === 'CastError') {
            return sendError(res, 'Invalid message ID', 400);
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendValidationError(res, messages);
        }
        
        sendError(res, 'Failed to update message', 500, error);
    }
};

// @desc    Delete message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        
        if (!message) {
            return sendError(res, 'Message not found', 404);
        }

        sendSuccess(res, null, 'Message deleted successfully');

    } catch (error) {
        console.error('Delete message error:', error);
        
        if (error.name === 'CastError') {
            return sendError(res, 'Invalid message ID', 400);
        }
        
        sendError(res, 'Failed to delete message', 500, error);
    }
};

// @desc    Get messages statistics (Admin)
// @route   GET /api/contact/stats/overview
// @access  Private/Admin
exports.getMessageStats = async (req, res, next) => {
    try {
        const totalMessages = await Message.countDocuments();
        const unreadMessages = await Message.countDocuments({ isRead: false });
        const readMessages = await Message.countDocuments({ isRead: true });
        
        const statusCounts = await Message.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentMessages = await Message.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email subject status createdAt');

        sendSuccess(res, {
            total: totalMessages,
            unread: unreadMessages,
            read: readMessages,
            statusCounts,
            recentMessages
        }, 'Message statistics retrieved successfully');

    } catch (error) {
        console.error('Get message stats error:', error);
        sendError(res, 'Failed to retrieve message statistics', 500, error);
    }
};