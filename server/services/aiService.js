/**
 * AI Service
 * Handles communication with Python FastAPI backend
 */

const axios = require('axios');
const FormData = require('form-data');
const Logger = require('../utils/logger');

const PYTHON_API_BASE = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
const TIMEOUT = 15000; // 15 seconds

const AiService = {
  /**
   * Send image to Python backend for disease detection
   */
  predictDisease: async (imageBuffer, filename, mimetype) => {
    try {
      Logger.info('Sending image to Python AI for disease detection...');
      
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename,
        contentType: mimetype
      });

      const response = await axios.post(
        `${PYTHON_API_BASE}/api/disease/predict`,
        formData,
        {
          headers: { ...formData.getHeaders() },
          timeout: TIMEOUT
        }
      );

      Logger.success('Disease prediction received from Python backend');
      return response.data;
    } catch (error) {
      Logger.error('Disease prediction error', error.message);
      throw {
        statusCode: 503,
        message: 'AI service unavailable',
        details: error.message
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
      Logger.error('Soil analysis error', error.message);
      throw {
        statusCode: 503,
        message: 'Soil analysis service unavailable',
        details: error.message
      };
    }
  },

  /**
   * Get crop recommendation from Python backend
   */
  recommendCrops: async (cropData) => {
    try {
      Logger.info('Requesting crop recommendation from Python...');
      
      const response = await axios.post(
        `${PYTHON_API_BASE}/api/crop/recommend`,
        cropData,
        { timeout: TIMEOUT }
      );

      Logger.success('Crop recommendation received');
      return response.data;
    } catch (error) {
      Logger.error('Crop recommendation error', error.message);
      throw {
        statusCode: 503,
        message: 'Crop recommendation service unavailable',
        details: error.message
      };
    }
  },

  /**
   * Get AI farming advice from Python backend
   */
  getAiFarmingAdvice: async (adviceData) => {
    try {
      Logger.info('Requesting AI farming advice from Python...');
      
      const response = await axios.post(
        `${PYTHON_API_BASE}/api/advice`,
        adviceData,
        { timeout: TIMEOUT }
      );

      Logger.success('AI farming advice received');
      return response.data;
    } catch (error) {
      Logger.error('AI advice error', error.message);
      throw {
        statusCode: 503,
        message: 'AI advice service unavailable',
        details: error.message
      };
    }
  }
};

module.exports = AiService;
