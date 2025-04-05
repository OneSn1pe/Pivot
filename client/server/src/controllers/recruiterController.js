const Recruiter = require('../models/Recruiter');
const Candidate = require('../models/Candidate');
const JobPreference = require('../models/JobPreference');
const gptService = require('../services/gptService');
const mongoose = require('mongoose');

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
    console.log('Looking for matching candidates...');
    
    // Get recruiter's company
    const recruiter = await Recruiter.findById(req.user.id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    
    console.log(`Found recruiter from company: ${recruiter.company}`);
    
    // Make sure the User model is properly loaded for the general query
    const User = mongoose.model('User');
    
    // Get all candidates from the system by role field instead of discriminator
    // Focus on roadmap data and skills, minimize other candidate data for faster loading
    const allCandidates = await User.find({role: 'candidate'})
      .select('name email skills bookmarkedBy')
      .populate({
        path: 'roadmap',
        populate: {
          path: 'milestones',
          model: 'Milestone'
        }
      });
    
    console.log(`Found ${allCandidates.length} total candidates in the system`);
    
    // If no candidates found at all, return empty array
    if (allCandidates.length === 0) {
      return res.status(200).json({
        message: 'No candidates found in the system.',
        candidates: []
      });
    }
    
    // Create a case-insensitive regex for the company name
    const companyRegex = new RegExp(recruiter.company, 'i');
    
    // Add targeting information as a property but don't filter candidates
    const candidatesWithTargetingFlag = allCandidates.map(candidate => {
      const isTargetingCompany = candidate.targetCompanies && 
        candidate.targetCompanies.some(tc => 
          companyRegex.test(tc.company)
        );
      
      // Convert to a plain object so we can add the new property
      const candidateObj = candidate.toObject();
      candidateObj.isTargetingCompany = isTargetingCompany;
      
      return candidateObj;
    });
    
    // Return all candidates
    res.status(200).json({
      message: `Showing all ${allCandidates.length} candidates in the system.`,
      candidates: candidatesWithTargetingFlag,
      totalCount: allCandidates.length
    });
    
  } catch (error) {
    console.error('Get matching candidates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bookmark a candidate
exports.bookmarkCandidate = async (req, res) => {
  try {
    const { candidateId, notes } = req.body;
    console.log(`Attempting to bookmark candidate ${candidateId} with notes: ${notes}`);

    // Ensure models are properly loaded
    const User = mongoose.model('User');
    const Recruiter = mongoose.model('Recruiter');

    // Check if candidate exists
    const candidate = await User.findOne({ _id: candidateId, role: 'candidate' });
    if (!candidate) {
      console.log(`Candidate with ID ${candidateId} not found`);
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    console.log(`Found candidate: ${candidate.name}`);

    // Check if already bookmarked
    const recruiter = await Recruiter.findById(req.user.id);
    if (!recruiter) {
      console.log(`Recruiter with ID ${req.user.id} not found`);
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    
    console.log(`Found recruiter: ${recruiter.name}`);
    
    const alreadyBookmarked = recruiter.bookmarkedCandidates.some(
      bookmark => bookmark.candidate && bookmark.candidate.toString() === candidateId
    );

    if (alreadyBookmarked) {
      console.log(`Candidate ${candidateId} is already bookmarked by recruiter ${req.user.id}`);
      return res.status(400).json({ message: 'Candidate already bookmarked' });
    }

    console.log(`Adding bookmark for candidate ${candidateId} to recruiter ${req.user.id}`);
    
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

    console.log(`Successfully added bookmark to recruiter. Now updating candidate's bookmarkedBy list.`);
    
    // Add recruiter to candidate's bookmarkedBy list
    await User.findByIdAndUpdate(
      candidateId,
      { $push: { bookmarkedBy: req.user.id } }
    );
    
    console.log(`Successfully updated candidate's bookmarkedBy list.`);

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
    const User = mongoose.model('User');

    // Remove bookmark
    await Recruiter.findByIdAndUpdate(
      req.user.id,
      { $pull: { bookmarkedCandidates: { candidate: candidateId } } }
    );

    // Remove recruiter from candidate's bookmarkedBy list
    await User.findByIdAndUpdate(
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
    const User = mongoose.model('User');

    // Validate required fields
    if (!candidateId || !title || !description || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if candidate exists
    const candidate = await User.findOne({ _id: candidateId, role: 'candidate' });
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