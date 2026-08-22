/**
 * AI Controller
 * Handles HTTP requests for AI Agronomist advice and Chat endpoints.
 * Delegates Gemini/Python logic to AiService.
 */

const AiService = require('../services/aiService');
const Logger = require('../utils/logger');

const AiController = {
  /**
   * POST /api/ai/advice
   * Get AI Agronomist reasoning based on crop, disease, and weather context
   */
  getAdvice: async (req, res) => {
    try {
      const { crop, disease, severity, weather } = req.body;

      Logger.info(`API Hit: POST /api/ai/advice for crop: ${crop || 'General'}`);

      const adviceData = await AiService.getAiFarmingAdvice({
        crop,
        disease,
        severity,
        weather,
      });

      return res.status(200).json({
        success: true,
        data: adviceData,
      });
    } catch (error) {
      Logger.error('Error in AiController.getAdvice:', error.message || error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to generate AI advice',
        details: error.details || error.message,
      });
    }
  },

  /**
   * POST /api/ai/chat
   * Interactive Q&A chat with AgriSmart AI assistant
   */
  chat: async (req, res) => {
    try {
      const { question, message, prompt, chatHistory, context } = req.body;
      const questionText = question || message || prompt;

      if (!questionText || typeof questionText !== 'string' || !questionText.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Question or message is required',
        });
      }

      Logger.info(
        `API Hit: POST /api/ai/chat - Question: "${questionText.trim().substring(0, 30)}..."`
      );

      const replyText = await AiService.chatWithAi({
        question: questionText.trim(),
        chatHistory: chatHistory || [],
        context: context || {},
      });

      return res.status(200).json({
        success: true,
        reply: replyText,
      });
    } catch (error) {
      Logger.error('Error in AiController.chat:', error.message || error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process AI chat message',
        details: error.message || 'Internal Server Error',
      });
    }
  },
};

module.exports = AiController;