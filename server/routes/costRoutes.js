/**
 * Cost Estimation Routes
 */

const express = require('express');
const CostController = require('../controllers/costController');

const router = express.Router();

// Routes
router.post('/estimate', CostController.estimateCost);
router.post('/', CostController.estimateCost);

module.exports = router;
