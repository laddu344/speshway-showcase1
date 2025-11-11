const express = require('express');
const router = express.Router();
const {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
} = require('../controllers/portfolioController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadPortfolioImage } = require('../config/cloudinary');

router.route('/').get(getPortfolios).post(protect, admin, uploadPortfolioImage.single('image'), createPortfolio);
router.route('/:id').get(getPortfolio).put(protect, admin, uploadPortfolioImage.single('image'), updatePortfolio).delete(protect, admin, deletePortfolio);

module.exports = router;

