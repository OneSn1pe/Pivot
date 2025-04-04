const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
const Candidate = require('../models/Candidate');
const JobPreference = require('../models/JobPreference');
const gptService = require('./gptService');

/**
 * Generate a roadmap for a candidate
 * @param {String} candidateId - ID of the candidate
 * @returns {Object} - Generated roadmap
 */
const generateRoadmap = async (candidateId) => {
  try {
    // Get candidate data
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Get candidate's resume
    const resume = await Resume.findOne({ candidate: candidateId });
    if (!resume) {
      throw new Error('Resume not found for this candidate');
    }

    // Get target companies from candidate profile
    const targetCompanies = candidate.targetCompanies || [];
    if (targetCompanies.length === 0) {
      throw new Error('Candidate has not specified target companies');
    }

    // Get job preferences from target companies' recruiters (if available)
    const jobPreferences = [];
    for (const target of targetCompanies) {
      const companyPreferences = await JobPreference.find({
        'recruiter.company': { $regex: new RegExp(target.company, 'i') },
        position: { $regex: new RegExp(target.position, 'i') }
      }).populate('recruiter');
      
      if (companyPreferences.length > 0) {
        jobPreferences.push(...companyPreferences);
      }
    }

    // Generate roadmap using GPT
    const roadmapData = await gptService.generateRoadmap(
      resume.analysis || {},
      targetCompanies,
      jobPreferences
    );

    // Create new roadmap
    const roadmap = new Roadmap({
      candidate: candidateId,
      targetCompanies: targetCompanies.map(tc => ({
        company: tc.company,
        position: tc.position
      })),
      title: roadmapData.title,
      description: roadmapData.description,
      estimatedTimelineMonths: roadmapData.estimatedTimelineMonths,
      difficultyScore: roadmapData.difficultyScore,
      milestones: roadmapData.milestones.map(milestone => ({
        title: milestone.title,
        description: milestone.description,
        type: milestone.type,
        difficulty: milestone.difficulty,
        timeEstimate: milestone.timeEstimate,
        resources: milestone.resources,
        order: milestone.order,
        dependencies: [] // Will be populated later after all milestones are created
      })),
      alternativeRoutes: roadmapData.alternativeRoutes || [],
      gptAnalysis: roadmapData.gptAnalysis || {}
    });

    // Save the roadmap
    await roadmap.save();

    // Update candidate with roadmap reference
    candidate.roadmap = roadmap._id;
    await candidate.save();

    return roadmap;
  } catch (error) {
    console.error('Roadmap generation error:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
};

/**
 * Get a roadmap by ID
 * @param {String} roadmapId - ID of the roadmap
 * @returns {Object} - Roadmap document
 */
const getRoadmapById = async (roadmapId) => {
  try {
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }
    return roadmap;
  } catch (error) {
    console.error('Get roadmap error:', error);
    throw new Error('Failed to get roadmap');
  }
};

/**
 * Get a candidate's roadmap
 * @param {String} candidateId - ID of the candidate
 * @returns {Object} - Roadmap document
 */
const getRoadmapByCandidate = async (candidateId) => {
  try {
    const roadmap = await Roadmap.findOne({ candidate: candidateId });
    if (!roadmap) {
      throw new Error('Roadmap not found for this candidate');
    }
    return roadmap;
  } catch (error) {
    console.error('Get candidate roadmap error:', error);
    throw new Error('Failed to get candidate roadmap');
  }
};

/**
 * Update milestone completion status
 * @param {String} roadmapId - ID of the roadmap
 * @param {String} milestoneId - ID of the milestone
 * @param {Boolean} completed - Completion status
 * @returns {Object} - Updated roadmap
 */
const updateMilestoneStatus = async (roadmapId, milestoneIndex, completed) => {
  try {
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }

    if (!roadmap.milestones[milestoneIndex]) {
      throw new Error('Milestone not found');
    }

    // Update the milestone
    roadmap.milestones[milestoneIndex].completed = completed;
    if (completed) {
      roadmap.milestones[milestoneIndex].completionDate = Date.now();
    } else {
      roadmap.milestones[milestoneIndex].completionDate = null;
    }

    // Save the updated roadmap
    await roadmap.save();
    return roadmap;
  } catch (error) {
    console.error('Update milestone status error:', error);
    throw new Error('Failed to update milestone status');
  }
};

/**
 * Regenerate roadmap based on updated resume or target companies
 * @param {String} candidateId - ID of the candidate
 * @returns {Object} - Updated roadmap
 */
const regenerateRoadmap = async (candidateId) => {
  try {
    // Delete existing roadmap
    await Roadmap.findOneAndDelete({ candidate: candidateId });
    
    // Generate new roadmap
    return await generateRoadmap(candidateId);
  } catch (error) {
    console.error('Roadmap regeneration error:', error);
    throw new Error('Failed to regenerate roadmap');
  }
};

module.exports = {
  generateRoadmap,
  getRoadmapById,
  getRoadmapByCandidate,
  updateMilestoneStatus,
  regenerateRoadmap
};