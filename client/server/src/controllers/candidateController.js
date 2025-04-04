const Candidate = require('../models/Candidate');
const Resume = require('../models/Resume');
const resumeService = require('../services/resumeService');
const roadmapService = require('../services/roadmapService');
const gptService = require('../services/gptService');

// Get candidate profile
exports.getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id)
      .populate('resume')
      .populate('roadmap');
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.status(200).json(candidate);
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update candidate profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      skills, 
      education, 
      experience, 
      projects, 
      socialLinks 
    } = req.body;

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Update fields if provided
    if (name) candidate.name = name;
    if (skills) candidate.skills = skills;
    if (education) candidate.education = education;
    if (experience) candidate.experience = experience;
    if (projects) candidate.projects = projects;
    if (socialLinks) candidate.socialLinks = socialLinks;

    // Save updated candidate
    await candidate.save();
    res.status(200).json(candidate);
  } catch (error) {
    console.error('Update candidate profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload resume
exports.uploadResume = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const fileInfo = req.file;

    // Check if candidate already has a resume
    const existingResume = await Resume.findOne({ candidate: candidateId });

    let resume;
    if (existingResume) {
      // Update existing resume
      resume = await resumeService.updateResume(existingResume._id, fileInfo);
    } else {
      // Create new resume
      resume = await resumeService.saveResume(candidateId, fileInfo);

      // Update candidate with resume reference
      await Candidate.findByIdAndUpdate(candidateId, { resume: resume._id });
    }

    // Analyze the resume with GPT
    const analysis = await gptService.analyzeResume(resume.parsedData);
    
    // Update resume with analysis
    resume.analysis = analysis;
    await resume.save();

    res.status(200).json(resume);
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get resume
exports.getResume = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const resume = await resumeService.getResumeByCandidate(candidateId);

    res.status(200).json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update target companies
exports.updateTargetCompanies = async (req, res) => {
  try {
    const { targetCompanies } = req.body;
    
    if (!targetCompanies || !Array.isArray(targetCompanies)) {
      return res.status(400).json({ message: 'Target companies must be an array' });
    }

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Update target companies
    candidate.targetCompanies = targetCompanies;
    await candidate.save();

    // If the candidate has updated their target companies and has a resume,
    // regenerate the roadmap
    if (candidate.resume) {
      try {
        await roadmapService.regenerateRoadmap(candidate._id);
      } catch (roadmapError) {
        console.error('Roadmap regeneration error:', roadmapError);
        // Continue with the response even if roadmap generation fails
      }
    }

    res.status(200).json(candidate);
  } catch (error) {
    console.error('Update target companies error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate roadmap
exports.generateRoadmap = async (req, res) => {
  try {
    const candidateId = req.user.id;
    
    // Check if candidate has a resume
    const candidate = await Candidate.findById(candidateId);
    if (!candidate.resume) {
      return res.status(400).json({ message: 'Please upload a resume before generating a roadmap' });
    }

    // Check if candidate has target companies
    if (!candidate.targetCompanies || candidate.targetCompanies.length === 0) {
      return res.status(400).json({ message: 'Please add target companies before generating a roadmap' });
    }

    // Generate roadmap
    const roadmap = await roadmapService.generateRoadmap(candidateId);
    
    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get roadmap
exports.getRoadmap = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const roadmap = await roadmapService.getRoadmapByCandidate(candidateId);

    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update milestone status
exports.updateMilestoneStatus = async (req, res) => {
  try {
    const { milestoneIndex, completed } = req.body;
    
    if (typeof milestoneIndex !== 'number' || typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate || !candidate.roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Update milestone status
    const roadmap = await roadmapService.updateMilestoneStatus(
      candidate.roadmap,
      milestoneIndex,
      completed
    );
    
    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Update milestone status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get bookmarked recruiters
exports.getBookmarkedRecruiters = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const candidate = await Candidate.findById(candidateId)
      .populate({
        path: 'bookmarkedBy',
        select: 'name company position'
      });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.status(200).json(candidate.bookmarkedBy);
  } catch (error) {
    console.error('Get bookmarked recruiters error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};