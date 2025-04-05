const mongoose = require('mongoose');
const User = require('./User');

const recruiterSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  companyDescription: {
    type: String,
  },
  jobPreferences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPreference',
  }],
  bookmarkedCandidates: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
    },
    notes: String,
    bookmarkedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  incentivesOffered: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
    },
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['internship', 'mentorship', 'project', 'certification', 'scholarship', 'other'],
    },
    status: {
      type: String,
      enum: ['offered', 'accepted', 'completed', 'expired'],
      default: 'offered',
    },
    offerDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
  }],
  industry: {
    type: String,
  },
  companySize: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

// Ensure this model is registered with mongoose
const Recruiter = User.discriminator('recruiter', recruiterSchema);

// This additional export helps ensure model reference availability
if (!mongoose.models.Recruiter) {
  mongoose.model('Recruiter', recruiterSchema);
}

module.exports = Recruiter;