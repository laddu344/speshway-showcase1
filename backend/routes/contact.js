const express = require('express');
const router = express.Router();

// Import the entire controller object to avoid destructuring issues in Lambda
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// ------------------ Public Routes ------------------

// Submit contact form with optional resume upload
// Use contactController.upload.single() directly to ensure Multer is recognized
router.post(
  '/submit',
  contactController.upload.single('resume'),
  contactController.submitContact
);

// ------------------ Admin Routes (Protected) ------------------

router.get(
  '/submissions',
  protect,
  admin,
  contactController.getSubmissions
);

router.get(
  '/submission/:id',
  protect,
  admin,
  contactController.getSubmission
);

router.put(
  '/submission/:id/status',
  protect,
  admin,
  contactController.updateSubmissionStatus
);

router.post(
  '/submission/:id/reply',
  protect,
  admin,
  contactController.replyToSubmission
);

router.delete(
  '/submission/:id',
  protect,
  admin,
  contactController.deleteSubmission
);

module.exports = router;
