const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a skill name'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
    trim: true,
    unique: true
  },
  icon: {
    type: String,
    required: [true, 'Please provide an icon class'],
    trim: true
  },
  level: {
    type: Number,
    required: [true, 'Please provide a skill level'],
    min: [0, 'Level cannot be less than 0'],
    max: [100, 'Level cannot be more than 100']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: {
      values: ['frontend', 'backend', 'database', 'language', 'tool'],
      message: 'Category must be one of: frontend, backend, database, language, tool'
    }
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
skillSchema.index({ category: 1 });
skillSchema.index({ isActive: 1 });
skillSchema.index({ order: 1 });

module.exports = mongoose.model('Skill', skillSchema);