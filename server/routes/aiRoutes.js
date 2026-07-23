/**
 * AI Routes
 * /api/ai
 */

const express = require('express');
const router = express.Router();
const AiController = require('../controllers/aiController');

// Phase 3: AI Agronomist reasoning endpoint
router.post('/advice', AiController.getAdvice);

// Phase 10: Interactive AI Chatbot endpoint
router.post('/chat', AiController.chat);

module.exports = router;
