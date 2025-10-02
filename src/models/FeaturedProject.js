const mongoose = require('mongoose');

const featuredProjectSchema = new mongoose.Schema({
  projectIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }],
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one document exists
featuredProjectSchema.statics.getFeaturedProjects = function() {
  return this.findOne().populate('projectIds');
};

featuredProjectSchema.statics.saveFeaturedProjects = function(projectIds, userId) {
  return this.findOneAndUpdate(
    {},
    { projectIds, lastUpdatedBy: userId },
    { upsert: true, new: true }
  ).populate('projectIds');
};

module.exports = mongoose.model('FeaturedProject', featuredProjectSchema);