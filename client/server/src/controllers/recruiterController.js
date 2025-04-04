const Recruiter = require('../models/Recruiter');
const Candidate = require('../models/Candidate');
const JobPreference = require('../models/JobPreference');
const gptService = require('../services/gptService');

// Get recruiter profile
exports.getProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user.id)
      .populate('jobPreferences')
      .populate({
        path: 'bookmarkedCandidates.candidate',
        select: 'name email skills education experience projects'
      });
    
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.status(200).json(recruiter);
  } catch (error) {
    console.error('Get recruiter profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update recruiter profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      company, 
      position, 
      companyDescription, 
      industry, 
      companySize, 
      socialLinks 
    } = req.body;

    const recruiter = await Recruiter.findById(req.user.id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Update fields if provided
    if (name) recruiter.name = name;
    if (company) recruiter.company = company;
    if (position) recruiter.position = position;
    if (companyDescription) recruiter.companyDescription = companyDescription;
    if (industry) recruiter.industry = industry;
    if (companySize) recruiter.companySize = companySize;
    if (socialLinks) recruiter.socialLinks = socialLinks;

    // Save updated recruiter
    await recruiter.save();
    res.status(200).json(recruiter);
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create job preference
exports.createJobPreference = async (req, res) => {
  try {
    const { 
      position, 
      department, 
      experience, 
      keySkills, 
      educationRequirements, 
      certifications,
      jobDescription,
      responsibilities,
      location,
      remote,
      salaryRange
    } = req.body;

    // Validate required fields
    if (!position) {
      return res.status(400).json({ message: 'Position is required' });
    }

    // Create job preference
    const jobPreference = new JobPreference({
      recruiter: req.user.id,
      position,
      department,
      experience,
      keySkills,
      educationRequirements,
      certifications,
      jobDescription,
      responsibilities,
      location,
      remote,
      salaryRange
    });

    // If job description is provided, analyze it with GPT
    if (jobDescription) {
      try {
        const analysis = await gptService.analyzeJobDescription(jobDescription);
        
        // Merge the analysis with user-provided data
        if (!keySkills || keySkills.length === 0) {
          jobPreference.keySkills = [
            ...analysis.requiredSkills,
            ...analysis.preferredSkills
          ];
        }
        
        if (!educationRequirements || educationRequirements.length === 0) {
          jobPreference.educationRequirements = analysis.educationRequirements;
        }
        
        if (!responsibilities || responsibilities.length === 0) {
          jobPreference.responsibilities = analysis.responsibilities;
        }
      } catch (analysisError) {
        console.error('Job description analysis error:', analysisError);
        // Continue with the user-provided data if analysis fails
      }
    }

    // Save job preference
    await jobPreference.save();

    // Add job preference to recruiter
    await Recruiter.findByIdAndUpdate(
      req.user.id,
      { $push: { jobPreferences: jobPreference._id } }
    );

    res.status(201).json(jobPreference);
  } catch (error) {
    console.error('Create job preference error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get job preferences
exports.getJobPreferences = async (req, res) => {
  try {
    const jobPreferences = await JobPreference.find({ recruiter: req.user.id });
    res.status(200).json(jobPreferences);
  } catch (error) {
    console.error('Get job preferences error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update job preference
exports.updateJobPreference = async (req, res) => {
  try {
    const { jobPreferenceId } = req.params;
    const updateData = req.body;

    // Find job preference
    const jobPreference = await JobPreference.findById(jobPreferenceId);
    if (!jobPreference) {
      return res.status(404).json({ message: 'Job preference not found' });
    }

    // Check ownership
    if (jobPreference.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job preference' });
    }

    // Update job preference
    Object.keys(updateData).forEach(key => {
      if (key !== 'recruiter') { // Prevent changing the owner
        jobPreference[key] = updateData[key];
      }
    });

    // Save updated job preference
    await jobPreference.save();
    res.status(200).json(jobPreference);
  } catch (error) {
    console.error('Update job preference error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete job preference
exports.deleteJobPreference = async (req, res) => {
  try {
    const { jobPreferenceId } = req.params;

    // Find job preference
    const jobPreference = await JobPreference.findById(jobPreferenceId);
    if (!jobPreference) {
      return res.status(404).json({ message: 'Job preference not found' });
    }

    // Check ownership
    if (jobPreference.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job preference' });
    }

    // Delete job preference
    await JobPreference.findByIdAndDelete(jobPreferenceId);

    // Remove reference from recruiter
    await Recruiter.findByIdAndUpdate(
      req.user.id,
      { $pull: { jobPreferences: jobPreferenceId } }
    );

    res.status(200).json({ message: 'Job preference deleted successfully' });
  } catch (error) {
    console.error('Delete job preference error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get matching candidates
exports.getMatchingCandidates = async (req, res) => {
  try {
    // Get recruiter's company
    const recruiter = await Recruiter.findById(req.user.id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Find candidates who have targeted the recruiter's company
    const candidates = await Candidate.find({
      'targetCompanies.company': { $regex: new RegExp(recruiter.company, 'i') }
    })
    .populate('resume')
    .populate('roadmap')
    .select('-password');

    res.status(200).json(candidates);
  } catch (error) {
    console.error('Get matching candidates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bookmark a candidate
exports.bookmarkCandidate = async (req, res) => {
  try {
    const { candidateId, notes } = req.body;

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if already bookmarked
    const recruiter = await Recruiter.findById(req.user.id);
    const alreadyBookmarked = recruiter.bookmarkedCandidates.some(
      bookmark => bookmark.candidate.toString() === candidateId
    );

    if (alreadyBookmarked) {
      return res.status(400).json({ message: 'Candidate already bookmarked' });
    }

    // Add bookmark
    await Recruiter.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          bookmarkedCandidates: {
            candidate: candidateId,
            notes: notes || '',
            bookmarkedAt: Date.now()
          }
        }
      }
    );

    // Add recruiter to candidate's bookmarkedBy list
    await Candidate.findByIdAndUpdate(
      candidateId,
      { $push: { bookmarkedBy: req.user.id } }
    );

    res.status(200).json({ message: 'Candidate bookmarked successfully' });
  } catch (error) {
    console.error('Bookmark candidate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove bookmark from a candidate
exports.removeBookmark = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Remove bookmark
    await Recruiter.findByIdAndUpdate(
      req.user.id,
      { $pull: { bookmarkedCandidates: { candidate: candidateId } } }
    );

    // Remove recruiter from candidate's bookmarkedBy list
    await Candidate.findByIdAndUpdate(
      candidateId,
      { $pull: { bookmarkedBy: req.user.id } }
    );

    res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Offer incentive to a candidate
exports.offerIncentive = async (req, res) => {
  try {
    const { candidateId, title, description, type, expiryDate } = req.body;

    // Validate required fields
    if (!candidateId || !title || !description || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if candidate is bookmarked
    const recruiter = await Recruiter.findById(req.user.id);
    const isBookmarked = recruiter.bookmarkedCandidates.some(
      bookmark => bookmark.candidate.toString() === candidateId
    );

    if (!isBookmarked) {
      return res.status(400).json({ message: 'You must bookmark the candidate before offering incentives' });
    }

    // Add incentive
    await Recruiter.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          incentivesOffered: {
            candidate: candidateId,
            title,
            description,
            type,
            status: 'offered',
            offerDate: Date.now(),
            expiryDate: expiryDate || null
          }
        }
      }
    );

    res.status(200).json({ message: 'Incentive offered successfully' });
  } catch (error) {
    console.error('Offer incentive error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get offered incentives
exports.getOfferedIncentives = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user.id)
      .populate({
        path: 'incentivesOffered.candidate',
        select: 'name email'
      });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.status(200).json(recruiter.incentivesOffered);
  } catch (error) {
    console.error('Get offered incentives error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update incentive status
exports.updateIncentiveStatus = async (req, res) => {
  try {
    const { incentiveId, status } = req.body;

    // Validate status
    const validStatuses = ['offered', 'accepted', 'completed', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update incentive
    const recruiter = await Recruiter.findOneAndUpdate(
      { 
        _id: req.user.id,
        'incentivesOffered._id': incentiveId
      },
      {
        $set: { 'incentivesOffered.$.status': status }
      },
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({ message: 'Incentive not found' });
    }

    res.status(200).json({ message: 'Incentive status updated successfully' });
  } catch (error) {
    console.error('Update incentive status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};