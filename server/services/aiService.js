/**
 * AI Service
 * Handles communication with Python FastAPI backend (Vision/ML)
 * and Google Gemini AI (Agronomist Reasoning & Chatbot)
 */

const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenAI } = require('@google/genai');
const Logger = require('../utils/logger');

// Dynamically use environment variable with fallback to live Render URL
const PYTHON_API_BASE =
  process.env.PYTHON_API_URL ||
  process.env.AI_SERVICE_URL ||
  'https://agrismart-pro-2.onrender.com';

const TIMEOUT = 15000; // 15 seconds

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  Logger.warn('GEMINI_API_KEY is missing in .env file!');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const AiService = {
  /**
   * Send image to Python backend for disease detection (FastAPI / YOLO / OpenCV)
   */
  predictDisease: async (imageBuffer, filename, mimetype) => {
    try {
      Logger.info('Sending image to Python AI for disease detection...');

      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename,
        contentType: mimetype,
      });

      const response = await axios.post(
        `${PYTHON_API_BASE}/api/disease/predict`,
        formData,
        {
          headers: { ...formData.getHeaders() },
          timeout: TIMEOUT,
        }
      );

      Logger.success('Disease prediction received from Python backend');
      return response.data;
    } catch (error) {
      Logger.error('Disease prediction error:', error.message);
      throw {
        statusCode: 503,
        message: 'AI vision service unavailable',
        details: error.message,
      };
    }
  },

  /**
   * Get soil analysis from Python backend
   */
  analyzeSoil: async (soilData) => {
    try {
      Logger.info('Sending soil data to Python for analysis...');

      const response = await axios.post(
        `${PYTHON_API_BASE}/api/soil/analyze`,
        soilData,
        { timeout: TIMEOUT }
      );

      Logger.success('Soil analysis received');
      return response.data;
    } catch (error) {
      Logger.error('Soil analysis error:', error.message);
      throw {
        statusCode: 503,
        message: 'Soil analysis service unavailable',
        details: error.message,
      };
    }
  },

  /**
   * Get crop recommendation from Python backend
   */
  recommendCrops: async (cropData) => {
    const endpoint = `${PYTHON_API_BASE}/api/crop/recommend`;

    try {
      Logger.info(`Requesting crop recommendation from: ${endpoint}`);
      Logger.info(`Request Payload: ${JSON.stringify(cropData)}`);

      const response = await axios.post(
        endpoint,
        cropData,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: TIMEOUT,
        }
      );

      Logger.success("Crop recommendation received successfully");
      Logger.info(`Response: ${JSON.stringify(response.data)}`);

      return response.data;
    } catch (error) {
      Logger.error("Crop recommendation request failed");

      if (error.response) {
        Logger.error(`Status Code: ${error.response.status}`);
        Logger.error(`Response Body: ${JSON.stringify(error.response.data)}`);

        throw {
          statusCode: error.response.status,
          message:
            error.response.data?.detail ||
            error.response.data?.message ||
            "Crop recommendation service unavailable",
          details: error.response.data,
        };
      }

      if (error.request) {
        Logger.error("No response received from Python backend.");

        throw {
          statusCode: 503,
          message: "Python AI server is unreachable.",
          details: error.message,
        };
      }

      Logger.error(`Unexpected Error: ${error.message}`);

      throw {
        statusCode: 500,
        message: "Unexpected error while requesting crop recommendation.",
        details: error.message,
      };
    }
  },

  /**
   * Phase 3: AI Agronomist Reasoning (Powered by Gemini LLM with Python fallback)
   */
  getAiFarmingAdvice: async ({ crop, disease, severity, weather }) => {
    if (ai) {
      try {
        Logger.info(
          `Generating Gemini Agronomist reasoning for ${crop || 'General'} (${disease || 'General Check'})`
        );

        const prompt = `
You are an expert AI Agronomist and Crop Specialist for AgriSmart Pro.
Analyze the following farm diagnostic data and provide a structured, practical, and highly actionable report for the farmer.

[FARM DIAGNOSTIC DATA]
- Crop: ${crop || 'General Crop'}
- Detected Issue/Disease: ${disease || 'Not specified / Health Check'}
- Severity: ${severity || 'Moderate'}
- Current Temperature: ${weather?.temperature ?? 'N/A'}°C
- Current Humidity: ${weather?.humidity ?? 'N/A'}%
- Wind Speed: ${weather?.wind_speed ?? 'N/A'} m/s
- Recent Rainfall: ${weather?.rainfall ?? 0} mm
- Weather Description: ${weather?.description ?? 'N/A'}

[INSTRUCTIONS]
Provide a concise, professional response in JSON format matching this EXACT schema:
{
  "diagnosisSummary": "A clear 2-sentence explanation of the condition and why environmental factors (temp/humidity) are affecting it.",
  "immediateActions": ["Action item 1", "Action item 2", "Action item 3"],
  "sprayWindow": {
    "recommended": true,
    "reason": "Clear explanation of whether current wind, humidity, and rainfall permit chemical or organic spraying today."
  },
  "irrigationAdvice": "Specific watering recommendation based on current soil/weather conditions.",
  "preventativeMeasures": ["Prevention tip 1", "Prevention tip 2"]
}

Return ONLY valid JSON. Do not wrap in markdown code fences (\`\`\`json).
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
        });

        const rawText =
          typeof response.text === 'function' ? response.text() : response.text;

        // Robust JSON extraction matching `{ ... }` block
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Invalid JSON structure received from AI response.');
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        Logger.success(`Gemini AI advice generated for ${crop || 'General'}`);
        return parsedData;
      } catch (geminiError) {
        Logger.warn(
          'Gemini advice failed, falling back to Python API...',
          geminiError.message
        );
      }
    }

    // Fallback: Call Python FastAPI /api/advice if Gemini fails or is not configured
    try {
      const response = await axios.post(
        `${PYTHON_API_BASE}/api/advice`,
        { crop, disease, severity, weather },
        { timeout: TIMEOUT }
      );
      return response.data;
    } catch (error) {
      Logger.error('AI advice error:', error.message);
      throw {
        statusCode: 503,
        message: 'AI advice service unavailable',
        details: error.message,
      };
    }
  },

  /**
   * Phase 10: Interactive AI Chatbot (Gemini)
   */
  chatWithAi: async ({ question, chatHistory = [], context = {} }) => {
    try {
      if (!ai) {
        throw new Error('GEMINI_API_KEY is missing or invalid in environment variables.');
      }

      Logger.info(
        `Processing AI Chat question: "${question.substring(0, 40)}..."`
      );

      const systemContext = `
You are AgriSmart AI, a friendly, highly knowledgeable agronomist assistant for farmers.
You provide brief, direct, and actionable answers using modern farming practices, organic alternatives, and chemical safety.

CURRENT FARM CONTEXT:
- Location: ${context.city || 'Unknown'}
- Temperature: ${context.temperature ? context.temperature + '°C' : 'N/A'}
- Humidity: ${context.humidity ? context.humidity + '%' : 'N/A'}
- Wind Speed: ${context.wind_speed ? context.wind_speed + ' m/s' : 'N/A'}
- Selected Crop: ${context.crop || 'General'}

Rule 1: Keep answers under 150 words unless the farmer asks for a detailed breakdown.
Rule 2: Give practical, field-tested advice.
Rule 3: Use bullet points for steps or recommendations.
`;

      let conversationPrompt = `${systemContext}\n\n`;

      if (Array.isArray(chatHistory)) {
        chatHistory.forEach((msg) => {
          const role =
            msg.sender === 'user' || msg.role === 'user'
              ? 'Farmer'
              : 'AgriSmart AI';
          const text = msg.text || msg.content || '';
          if (text) {
            conversationPrompt += `${role}: ${text}\n`;
          }
        });
      }

      conversationPrompt += `Farmer: ${question}\nAgriSmart AI:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: conversationPrompt,
      });

      const replyText =
        typeof response.text === 'function' ? response.text() : response.text;

      if (!replyText) {
        throw new Error('Empty response received from Gemini API.');
      }

      return replyText.trim();
    } catch (error) {
      Logger.error('AI Chat Error in AiService:', error.message || error);
      throw error;
    }
  },
};

module.exports = AiService;