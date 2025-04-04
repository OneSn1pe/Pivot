const mongoose = require('mongoose');

const jobPreferenceSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  department: {
    type: String,
  },
  experience: {
    min: Number,
    max: Number,
  },
  keySkills: [{
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    required: {
      type: Boolean,
      default: true,
    },
  }],
  educationRequirements: [{
    degree: String,
    field: String,
    required: Boolean,
  }],
  certifications: [{
    name: String,
    required: Boolean,
  }],
  jobDescription: {
    type: String,
  },
  responsibilities: [String],
  location: {
    type: String,
  },
  remote: {
    type: Boolean,
    default: false,
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD',
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'filled'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const JobPreference = mongoose.model('JobPreference', jobPreferenceSchema);

module.exports = JobPreference;