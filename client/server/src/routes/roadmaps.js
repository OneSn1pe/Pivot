const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Roadmap routes accessible by both candidates and recruiters
router.get('/:roadmapId', roadmapController.getRoadmapById);
router.get('/:roadmapId/progress', roadmapController.scoreRoadmapProgress);
router.get('/:roadmapId/recommendations', roadmapController.getTargetCompanyRecommendations);

// Route to check candidate compatibility with job requirements
router.post('/compatibility/:candidateId', roadmapController.checkCandidateCompatibility);

module.exports = router;