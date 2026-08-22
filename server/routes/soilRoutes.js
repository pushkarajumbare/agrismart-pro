/**
 * Soil Analysis Routes
 */

const express = require('express');
const SoilController = require('../controllers/soilController');

const router = express.Router();

// Routes
router.post('/analyze', SoilController.analyzeSoil);
router.post('/', SoilController.analyzeSoil);

module.exports = router;