const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  file: {
    filename: String,
    path: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  parsedData: {
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String,
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      years: String,
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
    }],
    certifications: [String],
  },
  // GPT Analysis results
  analysis: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    keySkills: [String],
    skillGaps: [String],
    potentialRoles: [String],
    analysisDate: {
      type: Date,
      default: Date.now,
    },
  },
  versions: [{
    file: {
      filename: String,
      path: String,
      originalName: String,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;