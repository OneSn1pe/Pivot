const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
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
  }],
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  estimatedTimelineMonths: {
    type: Number,
    required: true,
  },
  difficultyScore: {
    type: Number,
    min: 1,
    max: 10,
  },
  milestones: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['project', 'certification', 'course', 'skill', 'job', 'internship', 'networking', 'education', 'other'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    timeEstimate: {
      amount: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
      },
    },
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['article', 'video', 'course', 'book', 'documentation', 'tool', 'other'],
      },
    }],
    completed: {
      type: Boolean,
      default: false,
    },
    completionDate: Date,
    order: {
      type: Number,
      required: true,
    },
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    }],
  }],
  alternativeRoutes: [{
    title: {
      type: String,
      required: true,
    },
    description: String,
    milestones: [{
      title: String,
      description: String,
      type: {
        type: String,
        enum: ['project', 'certification', 'course', 'skill', 'job', 'internship', 'networking', 'education', 'other'],
      },
    }],
  }],
  gptAnalysis: {
    reasoning: String,
    keyInsights: [String],
    marketTrends: [String],
    companyCulture: [String],
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

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;