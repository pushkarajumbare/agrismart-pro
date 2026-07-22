/**
 * Crop Recommendation Routes
 */

const express = require('express');
const CropController = require('../controllers/cropController');

const router = express.Router();

// Routes
router.post('/recommend', CropController.recommendCrops);

module.exports = router;
