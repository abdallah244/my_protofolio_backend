const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        maxlength: [50, 'Name cannot be more than 50 characters'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        maxlength: [100, 'Subject cannot be more than 100 characters'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Please provide your message'],
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'responded'],
        default: 'unread'
    },
    response: {
        type: String,
        maxlength: [1000, 'Response cannot be more than 1000 characters']
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    respondedAt: {
        type: Date
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better performance
messageSchema.index({ email: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);