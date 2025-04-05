const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
const Candidate = require('../models/Candidate');
const JobPreference = require('../models/JobPreference');
const gptService = require('./gptService');

/**
 * Validate and transform roadmap data from GPT to match Mongoose schema
 * @param {Object} roadmapData - Data from GPT
 * @returns {Object} - Transformed data
 */
const validateAndTransformRoadmapData = (roadmapData) => {
  try {
    console.log('Validating and transforming roadmap data...');
    
    // Create a copy of the data to avoid modifying the original
    const transformedData = JSON.parse(JSON.stringify(roadmapData));
    
    // Normalize title and description
    transformedData.title = transformedData.title || 'Career Roadmap';
    transformedData.description = transformedData.description || 'A personalized career roadmap';
    
    // Ensure numeric fields are numbers
    transformedData.estimatedTimelineMonths = parseInt(transformedData.estimatedTimelineMonths) || 6;
    transformedData.difficultyScore = parseInt(transformedData.difficultyScore) || 5;
    
    // Process milestones
    if (Array.isArray(transformedData.milestones)) {
      transformedData.milestones = transformedData.milestones.map((milestone, index) => {
        // Normalize milestone fields
        const transformedMilestone = {
          title: milestone.title || `Milestone ${index + 1}`,
          description: milestone.description || '',
          // Ensure type is in allowed values
          type: (milestone.type && ['project', 'certification', 'course', 'skill', 'job', 'internship', 'networking', 'education', 'other'].includes(milestone.type.toLowerCase()))
            ? milestone.type.toLowerCase()
            : 'other',
          // Ensure difficulty is in allowed values
          difficulty: (milestone.difficulty && ['beginner', 'intermediate', 'advanced', 'expert'].includes(milestone.difficulty.toLowerCase()))
            ? milestone.difficulty.toLowerCase()
            : 'intermediate',
          order: milestone.order || index,
          completed: false
        };
        
        // Process timeEstimate
        if (milestone.timeEstimate) {
          transformedMilestone.timeEstimate = {
            amount: parseInt(milestone.timeEstimate.amount) || 1,
            unit: milestone.timeEstimate.unit || 'weeks'
          };
          
          // Normalize timeEstimate unit to plural form
          if (transformedMilestone.timeEstimate.unit === 'month') {
            transformedMilestone.timeEstimate.unit = 'months';
          } else if (transformedMilestone.timeEstimate.unit === 'day') {
            transformedMilestone.timeEstimate.unit = 'days';
          } else if (transformedMilestone.timeEstimate.unit === 'week') {
            transformedMilestone.timeEstimate.unit = 'weeks';
          } else if (transformedMilestone.timeEstimate.unit === 'year') {
            transformedMilestone.timeEstimate.unit = 'months';
            transformedMilestone.timeEstimate.amount *= 12; // Convert years to months
          }
        } else {
          transformedMilestone.timeEstimate = { amount: 2, unit: 'weeks' };
        }
        
        // Process resources
        if (Array.isArray(milestone.resources)) {
          transformedMilestone.resources = milestone.resources.map(resource => {
            const validTypes = ['article', 'video', 'course', 'book', 'documentation', 'tool', 'other', 'certification', 'event', 'website', 'community', 'conference', 'podcast'];
            
            // Map similar types to their valid counterparts
            let normalizedType = resource.type ? resource.type.toLowerCase() : 'other';
            if (!validTypes.includes(normalizedType)) {
              // Map similar types to allowed values
              if (normalizedType.includes('cert')) normalizedType = 'other';
              else if (normalizedType.includes('event')) normalizedType = 'other';
              else normalizedType = 'other';
            }
            
            return {
              title: resource.title || 'Resource',
              url: resource.url || '#',
              type: normalizedType
            };
          });
        } else {
          transformedMilestone.resources = [];
        }
        
        // Process dependencies
        transformedMilestone.dependencies = Array.isArray(milestone.dependencies) ? milestone.dependencies : [];
        
        return transformedMilestone;
      });
    } else {
      transformedData.milestones = [];
    }
    
    // Process alternativeRoutes
    if (Array.isArray(transformedData.alternativeRoutes)) {
      transformedData.alternativeRoutes = transformedData.alternativeRoutes.map((route, index) => ({
        title: route.title || `Alternative Route ${index + 1}`,
        description: route.description || '',
        milestones: Array.isArray(route.milestones) ? route.milestones.map((m, i) => ({
          title: m.title || `Alternative Milestone ${i + 1}`,
          description: m.description || '',
          type: (m.type && ['project', 'certification', 'course', 'skill', 'job', 'internship', 'networking', 'education', 'other'].includes(m.type.toLowerCase()))
            ? m.type.toLowerCase()
            : 'other'
        })) : []
      }));
    } else {
      transformedData.alternativeRoutes = [];
    }
    
    // Process gptAnalysis
    if (transformedData.gptAnalysis) {
      transformedData.gptAnalysis = {
        reasoning: transformedData.gptAnalysis.reasoning || '',
        keyInsights: Array.isArray(transformedData.gptAnalysis.keyInsights) ? transformedData.gptAnalysis.keyInsights : [],
        marketTrends: Array.isArray(transformedData.gptAnalysis.marketTrends) ? transformedData.gptAnalysis.marketTrends : [],
        companyCulture: Array.isArray(transformedData.gptAnalysis.companyCulture) ? transformedData.gptAnalysis.companyCulture : []
      };
    } else {
      transformedData.gptAnalysis = {
        reasoning: '',
        keyInsights: [],
        marketTrends: [],
        companyCulture: []
      };
    }
    
    console.log('Roadmap data successfully transformed');
    return transformedData;
  } catch (error) {
    console.error('Error transforming roadmap data:', error);
    throw new Error(`Failed to transform roadmap data: ${error.message}`);
  }
};

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
    const rawRoadmapData = await gptService.generateRoadmap(
      resume.analysis || {},
      targetCompanies,
      jobPreferences
    );
    
    // Validate and transform roadmap data
    const roadmapData = validateAndTransformRoadmapData(rawRoadmapData);

    // Create new roadmap with empty dependencies arrays to prevent casting errors
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
        dependencies: [] // Always use empty array to avoid ObjectId casting issues
      })),
      alternativeRoutes: roadmapData.alternativeRoutes,
      gptAnalysis: roadmapData.gptAnalysis
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
  regenerateRoadmap,
  validateAndTransformRoadmapData
};