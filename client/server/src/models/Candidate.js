const mongoose = require('mongoose');
const User = require('./User');

const candidateSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  targetCompanies: [{
    company: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
  }],
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
  }],
  experience: [{
    company: String,
    position: String,
    description: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String,
    startDate: Date,
    endDate: Date,
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
  }],
});

// Ensure this model is registered with mongoose
const Candidate = User.discriminator('candidate', candidateSchema);

// This additional export helps ensure model reference availability
if (!mongoose.models.Candidate) {
  mongoose.model('Candidate', candidateSchema);
}

module.exports = Candidate;