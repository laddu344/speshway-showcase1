const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadTeamImage } = require('../config/cloudinary');

router.route('/').get(getTeamMembers).post(protect, admin, uploadTeamImage.single('image'), createTeamMember);
router.route('/:id').get(getTeamMember).put(protect, admin, uploadTeamImage.single('image'), updateTeamMember).delete(protect, admin, deleteTeamMember);

module.exports = router;

