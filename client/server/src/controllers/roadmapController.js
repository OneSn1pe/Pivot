const Roadmap = require('../models/Roadmap');
const Candidate = require('../models/Candidate');
const roadmapService = require('../services/roadmapService');
const gptService = require('../services/gptService');

// Get roadmap by ID
exports.getRoadmapById = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await roadmapService.getRoadmapById(roadmapId);
    
    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Score candidate's roadmap progress
exports.scoreRoadmapProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    
    // Get roadmap
    const roadmap = await Roadmap.findById(roadmapId)
      .populate({
        path: 'candidate',
        populate: {
          path: 'resume'
        }
      });
    
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Calculate completion percentage
    const totalMilestones = roadmap.milestones.length;
    const completedMilestones = roadmap.milestones.filter(m => m.completed).length;
    const completionPercentage = totalMilestones > 0 
      ? (completedMilestones / totalMilestones) * 100 
      : 0;

    // Calculate time progress
    const startDate = new Date(roadmap.createdAt);
    const currentDate = new Date();
    const targetEndDate = new Date(roadmap.createdAt);
    targetEndDate.setMonth(targetEndDate.getMonth() + roadmap.estimatedTimelineMonths);
    
    const totalDuration = targetEndDate - startDate;
    const elapsedDuration = currentDate - startDate;
    const timeProgress = Math.min(100, (elapsedDuration / totalDuration) * 100);

    // Check if on track
    const isOnTrack = completionPercentage >= timeProgress;

    // Calculate remaining time
    const remainingTimeMs = Math.max(0, targetEndDate - currentDate);
    const remainingDays = Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24));
    const remainingMonths = Math.ceil(remainingDays / 30);

    // Calculate skill improvement score
    let skillImprovementScore = 0;
    const skillMilestones = roadmap.milestones.filter(m => 
      m.type === 'skill' || m.type === 'course' || m.type === 'certification'
    );
    
    const completedSkillMilestones = skillMilestones.filter(m => m.completed).length;
    
    if (skillMilestones.length > 0) {
      skillImprovementScore = (completedSkillMilestones / skillMilestones.length) * 100;
    }

    const progressScore = {
      completionPercentage: Math.round(completionPercentage),
      timeProgress: Math.round(timeProgress),
      isOnTrack,
      remainingTime: {
        days: remainingDays,
        months: remainingMonths
      },
      skillImprovementScore: Math.round(skillImprovementScore),
      completedMilestones,
      totalMilestones
    };

    res.status(200).json(progressScore);
  } catch (error) {
    console.error('Score roadmap progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check candidate compatibility with job requirements
exports.checkCandidateCompatibility = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { jobRequirements } = req.body;

    // Validate job requirements
    if (!jobRequirements) {
      return res.status(400).json({ message: 'Job requirements are required' });
    }

    // Get candidate data
    const candidate = await Candidate.findById(candidateId)
      .populate('resume')
      .populate('roadmap');
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Prepare candidate profile
    const candidateProfile = {
      skills: candidate.skills || [],
      experience: candidate.experience || [],
      education: candidate.education || [],
      projects: candidate.projects || [],
      resume: candidate.resume?.parsedData || {},
      roadmap: {
        milestones: candidate.roadmap?.milestones || [],
        completedMilestones: candidate.roadmap?.milestones.filter(m => m.completed) || []
      }
    };

    // Score candidate against job requirements
    const compatibilityScore = await gptService.scoreCandidate(
      candidateProfile,
      jobRequirements
    );

    res.status(200).json(compatibilityScore);
  } catch (error) {
    console.error('Check candidate compatibility error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommendations for roadmap based on target company
exports.getTargetCompanyRecommendations = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { company, position } = req.query;

    // Validate parameters
    if (!company || !position) {
      return res.status(400).json({ message: 'Company and position are required' });
    }

    // Get roadmap
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Check if the provided company is in the target companies
    const isTargetCompany = roadmap.targetCompanies.some(
      tc => tc.company.toLowerCase() === company.toLowerCase() && 
           tc.position.toLowerCase() === position.toLowerCase()
    );

    if (!isTargetCompany) {
      return res.status(400).json({ 
        message: 'The specified company and position are not in the target companies list' 
      });
    }

    // Use GPT to create recommendations
    const prompt = `
    You are a software engineering career coach. Generate specific recommendations for a candidate targeting ${company} for a ${position} position.
    
    Based on the company culture and job requirements, what specific actions should the candidate prioritize in their roadmap?
    
    Please provide 3-5 specific recommendations with brief explanations. Format your response as a JSON object with an array of recommendations.
    `;

    const response = await gptService.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a career coach specializing in tech careers." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const recommendations = JSON.parse(response.choices[0].message.content);
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Get target company recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};