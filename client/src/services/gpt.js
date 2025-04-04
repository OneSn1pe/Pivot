import api from './api';

// Service for GPT-related features

/**
 * Analyze a resume using GPT-4o
 * @param {Object} resumeData - Parsed resume data
 * @returns {Promise} - Analysis results
 */
export const analyzeResume = async (resumeData) => {
  try {
    // This would typically call a backend endpoint that interfaces with GPT
    const response = await api.post('/candidates/resume/analyze', { resumeData });
    return response.data;
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw error;
  }
};

/**
 * Generate career roadmap suggestions
 * @param {Object} candidateData - Candidate profile data
 * @param {Array} targetCompanies - List of target companies and positions
 * @returns {Promise} - Roadmap suggestions
 */
export const generateRoadmapSuggestions = async (candidateData, targetCompanies) => {
  try {
    const response = await api.post('/candidates/roadmap/suggestions', {
      candidateData,
      targetCompanies
    });
    return response.data;
  } catch (error) {
    console.error('Roadmap suggestions error:', error);
    throw error;
  }
};

/**
 * Analyze a job description using GPT-4o
 * @param {String} jobDescription - Job description text
 * @returns {Promise} - Structured job requirements
 */
export const analyzeJobDescription = async (jobDescription) => {
  try {
    const response = await api.post('/recruiters/job-description/analyze', {
      jobDescription
    });
    return response.data;
  } catch (error) {
    console.error('Job description analysis error:', error);
    throw error;
  }
};

/**
 * Score a candidate against job requirements
 * @param {String} candidateId - ID of the candidate
 * @param {Object} jobRequirements - Job requirements
 * @returns {Promise} - Compatibility score
 */
export const scoreCandidateCompatibility = async (candidateId, jobRequirements) => {
  try {
    const response = await api.post(`/roadmaps/compatibility/${candidateId}`, {
      jobRequirements
    });
    return response.data;
  } catch (error) {
    console.error('Candidate compatibility scoring error:', error);
    throw error;
  }
};

/**
 * Get recommendations for a specific target company
 * @param {String} roadmapId - ID of the roadmap
 * @param {String} company - Target company name
 * @param {String} position - Target position
 * @returns {Promise} - Company-specific recommendations
 */
export const getTargetCompanyRecommendations = async (roadmapId, company, position) => {
  try {
    const response = await api.get(`/roadmaps/${roadmapId}/recommendations`, {
      params: { company, position }
    });
    return response.data;
  } catch (error) {
    console.error('Target company recommendations error:', error);
    throw error;
  }
};

/**
 * Score roadmap progress
 * @param {String} roadmapId - ID of the roadmap
 * @returns {Promise} - Progress score and analysis
 */
export const scoreRoadmapProgress = async (roadmapId) => {
  try {
    const response = await api.get(`/roadmaps/${roadmapId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Roadmap progress scoring error:', error);
    throw error;
  }
};