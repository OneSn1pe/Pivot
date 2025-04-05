const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const Candidate = require('../models/Candidate');
const PDFParser = require('pdf-parse');

/**
 * Save a new resume
 * @param {String} candidateId - ID of the candidate
 * @param {Object} fileInfo - Uploaded file information
 * @returns {Object} - Saved resume document
 */
const saveResume = async (candidateId, fileInfo) => {
  try {
    // Parse resume content
    const parsedData = await parseResume(fileInfo);

    // Create new resume
    const resume = new Resume({
      candidate: candidateId,
      file: {
        filename: fileInfo.filename,
        path: fileInfo.path,
        originalName: fileInfo.originalname,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
      },
      parsedData,
    });

    // Save resume
    await resume.save();
    return resume;
  } catch (error) {
    console.error('Save resume error:', error);
    throw new Error('Failed to save resume');
  }
};

/**
 * Update an existing resume
 * @param {String} resumeId - ID of the resume to update
 * @param {Object} fileInfo - Uploaded file information
 * @returns {Object} - Updated resume document
 */
const updateResume = async (resumeId, fileInfo) => {
  try {
    // Get existing resume
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // Add old file to versions
    resume.versions.push({
      file: {
        filename: resume.file.filename,
        path: resume.file.path,
        originalName: resume.file.originalName,
      },
    });

    // Parse resume content
    const parsedData = await parseResume(fileInfo);

    // Update resume data
    resume.file = {
      filename: fileInfo.filename,
      path: fileInfo.path,
      originalName: fileInfo.originalname,
      mimetype: fileInfo.mimetype,
      size: fileInfo.size,
      uploadDate: Date.now(),
    };
    resume.parsedData = parsedData;

    // Save updated resume
    await resume.save();
    return resume;
  } catch (error) {
    console.error('Update resume error:', error);
    throw new Error('Failed to update resume');
  }
};

/**
 * Get resume by candidate ID
 * @param {String} candidateId - ID of the candidate
 * @returns {Object} - Resume document
 */
const getResumeByCandidate = async (candidateId) => {
  try {
    const resume = await Resume.findOne({ candidate: candidateId });
    if (!resume) {
      throw new Error('Resume not found');
    }
    return resume;
  } catch (error) {
    console.error('Get resume error:', error);
    throw new Error('Failed to get resume');
  }
};

/**
 * Delete a resume
 * @param {String} resumeId - ID of the resume to delete
 * @returns {Boolean} - Operation success
 */
const deleteResume = async (resumeId) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // Delete file from disk
    if (resume.file && resume.file.path) {
      fs.unlinkSync(resume.file.path);
    }

    // Delete older versions
    if (resume.versions && resume.versions.length > 0) {
      resume.versions.forEach(version => {
        if (version.file && version.file.path) {
          try {
            fs.unlinkSync(version.file.path);
          } catch (e) {
            console.warn(`Could not delete file: ${version.file.path}`);
          }
        }
      });
    }

    // Delete resume document
    await Resume.findByIdAndDelete(resumeId);
    return true;
  } catch (error) {
    console.error('Delete resume error:', error);
    throw new Error('Failed to delete resume');
  }
};

/**
 * Parse resume file (PDF, DOCX) and extract structured information
 * @param {Object} fileInfo - Uploaded file information
 * @returns {Object} - Parsed resume data
 */
const parseResume = async (fileInfo) => {
  try {
    const filePath = fileInfo.path;
    const fileExtension = path.extname(fileInfo.originalname).toLowerCase();

    let text = '';
    // Handle different file types
    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await PDFParser(dataBuffer);
      text = pdfData.text;
    } else if (fileExtension === '.docx') {
      // Implement DOCX parsing if needed
      // For now, return a simpler structure
      return {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: []
      };
    } else {
      // Unsupported file type
      throw new Error('Unsupported file type');
    }

    // Simple parsing logic
    // This is a basic implementation - you can make this more sophisticated
    // or use a dedicated resume parsing library
    return {
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      projects: extractProjects(text),
      certifications: extractCertifications(text),
    };
  } catch (error) {
    console.error('Parse resume error:', error);
    // Return empty structure if parsing fails
    return {
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: []
    };
  }
};

// Helper extraction functions
// These are very basic implementations and would need to be enhanced
// with more sophisticated NLP or pattern matching for production use

const extractSkills = (text) => {
  // Simple skill extraction based on keywords
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
    'MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'NoSQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'Machine Learning', 'AI', 'TensorFlow', 'PyTorch',
    'Git', 'GitHub', 'Agile', 'Scrum', 'CI/CD'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
};

const extractExperience = (text) => {
  // Basic structure - in a real app, you'd need more sophisticated extraction
  const experiences = [];
  
  // Very basic extraction - this needs significant enhancement
  const lines = text.split('\n');
  let currentExperience = null;
  
  for (const line of lines) {
    // Very simplistic pattern matching
    if (line.includes('Experience') || line.includes('Work')) {
      currentExperience = {
        company: 'Unknown',
        position: line.trim(),
        duration: 'Unknown',
        description: ''
      };
      experiences.push(currentExperience);
    } else if (currentExperience) {
      currentExperience.description += line + ' ';
    }
  }
  
  return experiences.length > 0 ? experiences : [{
    company: 'Unknown',
    position: 'Unknown',
    duration: 'Unknown',
    description: 'Could not extract experience details'
  }];
};

const extractEducation = (text) => {
  // Basic extraction
  const education = [];
  
  // Detect common degrees
  const degrees = ['Bachelor', 'Master', 'PhD', 'BS', 'MS', 'BA', 'MA'];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (degrees.some(degree => line.includes(degree))) {
      education.push({
        institution: 'Unknown',
        degree: line.trim(),
        field: 'Unknown',
        years: 'Unknown'
      });
    }
  }
  
  return education.length > 0 ? education : [{
    institution: 'Unknown',
    degree: 'Unknown',
    field: 'Unknown',
    years: 'Unknown'
  }];
};

const extractProjects = (text) => {
  // Basic extraction
  const projects = [];
  
  // Very simple extraction
  if (text.toLowerCase().includes('project')) {
    projects.push({
      name: 'Project',
      description: 'Project detected in resume',
      technologies: []
    });
  }
  
  return projects;
};

const extractCertifications = (text) => {
  // Basic extraction
  const certifications = [];
  
  // Common certification keywords
  const certKeywords = ['certified', 'certification', 'certificate'];
  
  if (certKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (certKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        certifications.push(line.trim());
      }
    }
  }
  
  return certifications;
};

module.exports = {
  saveResume,
  updateResume,
  getResumeByCandidate,
  deleteResume,
  parseResume
};
