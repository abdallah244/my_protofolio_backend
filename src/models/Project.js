const mongoose = require('mongoose');

// Define the Project Schema
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a project title'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a project description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    shortDescription: {
        type: String,
        required: [true, 'Please provide a short description'],
        maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    technologies: [{
        type: String,
        trim: true
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        }
    }],
    liveUrl: {
        type: String,
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please provide a valid URL']
    },
    githubUrl: {
        type: String,
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please provide a valid URL']
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create and export the Model
module.exports = mongoose.model('Project', projectSchema);