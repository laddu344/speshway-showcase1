const Portfolio = require('../models/Portfolio');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all portfolios
// @route   GET /api/portfolios
// @access  Public
const getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single portfolio
// @route   GET /api/portfolios/:id
// @access  Public
const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create portfolio
// @route   POST /api/portfolios
// @access  Private/Admin
const createPortfolio = async (req, res) => {
  try {
    const portfolioData = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      technologies: typeof req.body.technologies === 'string' 
        ? JSON.parse(req.body.technologies) 
        : req.body.technologies,
      color: req.body.color || 'from-blue-500/20 to-cyan-500/20',
      updatedAt: Date.now()
    };

    // Handle image upload if present
    if (req.file) {
      portfolioData.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const portfolio = new Portfolio(portfolioData);
    const createdPortfolio = await portfolio.save();
    res.status(201).json(createdPortfolio);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update portfolio
// @route   PUT /api/portfolios/:id
// @access  Private/Admin
const updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Delete old image from Cloudinary if new image is uploaded
    if (req.file && portfolio.image.publicId) {
      try {
        await cloudinary.uploader.destroy(portfolio.image.publicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Update portfolio fields
    if (req.body.title) portfolio.title = req.body.title;
    if (req.body.category) portfolio.category = req.body.category;
    if (req.body.description) portfolio.description = req.body.description;
    if (req.body.technologies) {
      portfolio.technologies = typeof req.body.technologies === 'string' 
        ? JSON.parse(req.body.technologies) 
        : req.body.technologies;
    }
    if (req.body.color) portfolio.color = req.body.color;
    
    // Handle new image upload
    if (req.file) {
      portfolio.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    portfolio.updatedAt = Date.now();
    const updatedPortfolio = await portfolio.save();
    res.json(updatedPortfolio);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private/Admin
const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Delete image from Cloudinary if exists
    if (portfolio.image.publicId) {
      try {
        await cloudinary.uploader.destroy(portfolio.image.publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await portfolio.deleteOne();
    res.json({ message: 'Portfolio removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
};

