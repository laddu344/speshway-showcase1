const Team = require('../models/Team');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res) => {
  try {
    const team = await Team.find().sort({ createdAt: -1 });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
const getTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create team member
// @route   POST /api/team
// @access  Private/Admin
const createTeamMember = async (req, res) => {
  try {
    const memberData = {
      ...req.body,
      updatedAt: Date.now()
    };

    // Handle image upload if present
    if (req.file) {
      memberData.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const member = new Team(memberData);
    const createdMember = await member.save();
    res.status(201).json(createdMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
const updateTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Delete old image from Cloudinary if new image is uploaded
    if (req.file && member.image.publicId) {
      try {
        await cloudinary.uploader.destroy(member.image.publicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    Object.assign(member, req.body);
    
    // Handle new image upload
    if (req.file) {
      member.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    member.updatedAt = Date.now();
    const updatedMember = await member.save();
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
const deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Delete image from Cloudinary if exists
    if (member.image.publicId) {
      try {
        await cloudinary.uploader.destroy(member.image.publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await member.deleteOne();
    res.json({ message: 'Team member removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
};

