const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require recruiter role
router.use(protect);
router.use(authorize('recruiter'));

// Profile routes
router.get('/profile', recruiterController.getProfile);
router.put('/profile', recruiterController.updateProfile);

// Job preferences routes
router.post('/job-preferences', recruiterController.createJobPreference);
router.get('/job-preferences', recruiterController.getJobPreferences);
router.put('/job-preferences/:jobPreferenceId', recruiterController.updateJobPreference);
router.delete('/job-preferences/:jobPreferenceId', recruiterController.deleteJobPreference);

// Candidate routes
router.get('/candidates', recruiterController.getMatchingCandidates);
router.post('/bookmark', recruiterController.bookmarkCandidate);
router.delete('/bookmark/:candidateId', recruiterController.removeBookmark);

// Incentives routes
router.post('/incentives', recruiterController.offerIncentive);
router.get('/incentives', recruiterController.getOfferedIncentives);
router.put('/incentives', recruiterController.updateIncentiveStatus);

module.exports = router;