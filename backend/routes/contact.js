const express = require('express');
const router = express.Router();

// Import controller functions
const contactController = require('../controllers/contactController');

// Destructure safely with defaults to avoid undefined
const {
  submitContact = (req, res) => res.status(500).json({ error: 'submitContact not implemented' }),
  getSubmissions = (req, res) => res.status(500).json({ error: 'getSubmissions not implemented' }),
  getSubmission = (req, res) => res.status(500).json({ error: 'getSubmission not implemented' }),
  updateSubmissionStatus = (req, res) => res.status(500).json({ error: 'updateSubmissionStatus not implemented' }),
  replyToSubmission = (req, res) => res.status(500).json({ error: 'replyToSubmission not implemented' }),
  deleteSubmission = (req, res) => res.status(500).json({ error: 'deleteSubmission not implemented' }),
  upload
} = contactController;

// Import auth middleware
const { protect, admin } = require('../middleware/authMiddleware');

// --------------------- Public Route ---------------------
// Submit contact form with optional resume upload
router.post('/submit', upload.single('resume'), submitContact);

// --------------------- Admin Routes (Protected) ---------------------
router.get('/submissions', protect, admin, getSubmissions);
router.get('/submission/:id', protect, admin, getSubmission);
router.put('/submission/:id/status', protect, admin, updateSubmissionStatus);
router.post('/submission/:id/reply', protect, admin, replyToSubmission);
router.delete('/submission/:id', protect, admin, deleteSubmission);

module.exports = router;
