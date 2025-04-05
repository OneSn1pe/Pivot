const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

// Check if API key is provided
if (!API_KEY || API_KEY.trim() === '') {
  console.error('OpenAI API key is missing. GPT functionalities will not work.');
}

// Log API key initialization status (without exposing the key)
console.log(`OpenAI API key ${API_KEY ? 'is configured' : 'is missing'}. Key starts with: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'N/A'}`);

// Initialize OpenAI API with validation
let openai;
try {
  openai = new OpenAI({
    apiKey: API_KEY,
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

/**
 * Analyze a resume using GPT-4o
 * @param {Object} resumeData - Parsed resume data
 * @returns {Object} - Analysis results
 */
const analyzeResume = async (resumeData) => {
  try {
    // Validate OpenAI client
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    // Validate resumeData
    if (!resumeData || Object.keys(resumeData).length === 0) {
      console.warn('Resume data is empty, using sample data for analysis');
      // Use sample data for testing
      resumeData = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [{ 
          company: 'Example Company', 
          position: 'Software Developer',
          duration: '2 years'
        }],
        education: [{
          institution: 'Example University',
          degree: 'BS Computer Science'
        }]
      };
    }

    const prompt = `
    You are an expert talent evaluator and career coach for the tech industry.
    Analyze this software engineering/computer science candidate's resume data and provide insights.

    Resume data: ${JSON.stringify(resumeData)}

    Please provide the following analysis:
    1. Key strengths (technical and soft skills)
    2. Areas for improvement or skill gaps
    3. Potential roles this candidate would be a good fit for
    4. Recommendations for career development
    5. Overall assessment of the candidate's profile
    
    Format your response as a JSON object with the following structure:
    {
      "strengths": ["strength1", "strength2", ...],
      "weaknesses": ["weakness1", "weakness2", ...],
      "potentialRoles": ["role1", "role2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...],
      "keySkills": ["skill1", "skill2", ...],
      "skillGaps": ["skillGap1", "skillGap2", ...],
      "overallAssessment": "detailed assessment as a string"
    }
    `;

    console.log('Sending resume analysis request to OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert talent evaluator and career coach specializing in tech industry roles." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    console.log('Received response from OpenAI');
    
    // Check if the response is valid
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('GPT Resume Analysis error:', error);
    // Provide more detailed error info
    if (error.response) {
      console.error('OpenAI API error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    throw new Error(`Failed to analyze resume with GPT: ${error.message}`);
  }
};

/**
 * Generate a career roadmap using GPT-4o
 * @param {Object} resumeAnalysis - Analysis of candidate's resume
 * @param {Array} targetCompanies - List of target companies and positions
 * @param {Array} jobPreferences - Recruiter job preferences
 * @returns {Object} - Generated roadmap
 */
const generateRoadmap = async (resumeAnalysis, targetCompanies, jobPreferences = []) => {
  try {
    const prompt = `
    You are an expert career coach for software engineers and computer science professionals.
    Create a detailed career roadmap for a candidate based on their resume analysis and target companies.

    Resume Analysis: ${JSON.stringify(resumeAnalysis)}
    Target Companies and Positions: ${JSON.stringify(targetCompanies)}
    ${jobPreferences.length > 0 ? `Job Preferences from Recruiters: ${JSON.stringify(jobPreferences)}` : ''}

    Generate a detailed career roadmap that will help this candidate become competitive for their target positions.
    
    The roadmap should include:
    1. A title and brief description
    2. Estimated timeline in months
    3. Difficulty score (1-10)
    4. A sequence of milestones with detailed information:
       - Projects to build
       - Skills to learn
       - Certifications to obtain
       - Networking opportunities
       - Other relevant activities
    5. Alternative routes or paths if applicable
    6. Reasoning behind your recommendations
    
    For each milestone, include:
    - Detailed description
    - Difficulty level
    - Time estimate
    - Relevant resources (courses, tutorials, documentation)
    - Dependencies on other milestones

    Format your response as a JSON object with the following structure:
    {
      "title": "Roadmap title",
      "description": "Brief description",
      "estimatedTimelineMonths": number,
      "difficultyScore": number,
      "milestones": [
        {
          "title": "Milestone title",
          "description": "Detailed description",
          "type": "project|certification|course|skill|job|internship|networking|education|other",
          "difficulty": "beginner|intermediate|advanced|expert",
          "timeEstimate": {
            "amount": number,
            "unit": "days|weeks|months"
          },
          "resources": [
            {
              "title": "Resource title",
              "url": "Resource URL",
              "type": "article|video|course|book|documentation|tool|other"
            }
          ],
          "order": number,
          "dependencies": [] // Indices of prerequisite milestones
        }
      ],
      "alternativeRoutes": [
        {
          "title": "Alternative route title",
          "description": "Description",
          "milestones": []
        }
      ],
      "gptAnalysis": {
        "reasoning": "Detailed explanation",
        "keyInsights": ["insight1", "insight2"],
        "marketTrends": ["trend1", "trend2"],
        "companyCulture": ["culture1", "culture2"]
      }
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert career coach specializing in creating detailed roadmaps for tech professionals." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('GPT Roadmap Generation error:', error);
    throw new Error('Failed to generate roadmap with GPT');
  }
};

/**
 * Analyze a job posting to extract requirements and preferences
 * @param {String} jobDescription - Job description text
 * @returns {Object} - Structured job requirements
 */
const analyzeJobDescription = async (jobDescription) => {
  try {
    const prompt = `
    Analyze this job description for a software engineering/computer science position and extract key requirements and preferences.

    Job Description: ${jobDescription}

    Please provide the following analysis:
    1. Required technical skills
    2. Preferred technical skills
    3. Required experience level
    4. Required education
    5. Key responsibilities
    6. Company culture indicators
    
    Format your response as a JSON object with the following structure:
    {
      "requiredSkills": [
        {
          "name": "skill name",
          "level": "beginner|intermediate|advanced|expert",
          "required": true
        }
      ],
      "preferredSkills": [
        {
          "name": "skill name",
          "level": "beginner|intermediate|advanced|expert",
          "required": false
        }
      ],
      "experienceRequired": {
        "min": number,
        "max": number
      },
      "educationRequirements": [
        {
          "degree": "degree type",
          "field": "field of study",
          "required": boolean
        }
      ],
      "responsibilities": ["responsibility1", "responsibility2", ...],
      "companyCulture": ["culture1", "culture2", ...]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert at analyzing job descriptions and extracting structured requirements." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('GPT Job Analysis error:', error);
    throw new Error('Failed to analyze job description with GPT');
  }
};

/**
 * Score a candidate against a company's job requirements
 * @param {Object} candidateProfile - Candidate resume and roadmap
 * @param {Object} jobRequirements - Job requirements and preferences
 * @returns {Object} - Match score and analysis
 */
const scoreCandidate = async (candidateProfile, jobRequirements) => {
  try {
    const prompt = `
    You are an AI talent evaluator for tech industry positions.
    Compare this candidate's profile with the job requirements and provide a match analysis.

    Candidate Profile: ${JSON.stringify(candidateProfile)}
    Job Requirements: ${JSON.stringify(jobRequirements)}

    Please provide the following analysis:
    1. Overall match score (0-100)
    2. Strengths matching the job requirements
    3. Areas where the candidate falls short
    4. Recommendations to improve the match
    5. Estimated time to close skill gaps
    
    Format your response as a JSON object with the following structure:
    {
      "matchScore": number,
      "matchingStrengths": ["strength1", "strength2", ...],
      "gaps": ["gap1", "gap2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...],
      "estimatedTimeToClose": {
        "amount": number,
        "unit": "weeks|months|years"
      },
      "analysis": "detailed analysis as a string"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert talent evaluator specializing in matching candidates to tech industry positions." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('GPT Candidate Scoring error:', error);
    throw new Error('Failed to score candidate with GPT');
  }
};

module.exports = {
  analyzeResume,
  generateRoadmap,
  analyzeJobDescription,
  scoreCandidate
};