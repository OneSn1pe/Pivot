const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');
const { handleResumeUpload } = require('../middleware/upload');

// All routes are protected and require candidate role
router.use(protect);
router.use(authorize('candidate'));

// Profile routes
router.get('/profile', candidateController.getProfile);
router.put('/profile', candidateController.updateProfile);

// Resume routes
router.post('/resume', handleResumeUpload, candidateController.uploadResume);
router.get('/resume', candidateController.getResume);

// Target companies routes
router.put('/target-companies', candidateController.updateTargetCompanies);

// Roadmap routes
router.post('/roadmap', candidateController.generateRoadmap);
router.get('/roadmap', candidateController.getRoadmap);
router.put('/roadmap/milestone', candidateController.updateMilestoneStatus);

// Bookmarked recruiters
router.get('/bookmarked-recruiters', candidateController.getBookmarkedRecruiters);

module.exports = router;