/**
 * AI Routes
 * /api/ai
 */

const express = require('express');
const router = express.Router();
const AiController = require('../controllers/aiController');

// Phase 3: AI Agronomist reasoning endpoint
router.post('/advice', AiController.getAdvice);
router.post('/ai/advice', AiController.getAdvice);
router.post('/farming-advice', AiController.getAdvice);

// Phase 10: Interactive AI Chatbot endpoint
router.post('/chat', AiController.chat);
router.post('/ai/chat', AiController.chat);

module.exports = router;
