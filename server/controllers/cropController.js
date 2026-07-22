/**
 * Crop Recommendation Controller
 * Handles crop recommendation endpoints
 */

const AiService = require('../services/aiService');
const InputValidator = require('../validators/inputValidator');
const ResponseHandler = require('../utils/response');
const Logger = require('../utils/logger');

const CropController = {
  /**
   * POST /api/crop/recommend
   * Recommend crops based on soil and weather data
   */
  recommendCrops: async (req, res, next) => {
    try {
      const { nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall, moisture } = req.body;

      // Validate input
      const validation = InputValidator.validateSoilData({
        nitrogen,
        phosphorus,
        potassium,
        ph,
        temperature,
        humidity,
        rainfall
      });

      if (!validation.valid) {
        return ResponseHandler.sendError(
          res,
          'Invalid crop recommendation data',
          400,
          { errors: validation.errors }
        );
      }

      Logger.info('Crop recommendation request validated, calling AI service...');

      // Call AI backend
      const recommendation = await AiService.recommendCrops({
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        ph: parseFloat(ph),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        rainfall: parseFloat(rainfall),
        moisture: parseFloat(moisture) || 50
      });

      // Structure response
      const response = {
        best_crop: recommendation.best_crop || 'Rice',
        top_5_alternatives: recommendation.top_5_alternatives || [
          'Wheat',
          'Maize',
          'Sugarcane',
          'Cotton',
          'Pulses'
        ],
        suitability_score: recommendation.suitability_score || 78,
        confidence: recommendation.confidence || 75,
        growing_duration: recommendation.growing_duration || '120-150 days',
        water_requirement: recommendation.water_requirement || '1000-1500 mm',
        expected_yield: recommendation.expected_yield || '4-6 tons/hectare',
        market_profitability: recommendation.market_profitability || 'High',
        npk_ratio: recommendation.npk_ratio || '100:60:40',
        ideal_temperature: recommendation.ideal_temperature || '20-30°C',
        ideal_humidity: recommendation.ideal_humidity || '60-80%',
        soil_type: recommendation.soil_type || 'Loamy'
      };

      ResponseHandler.send(
        res,
        response,
        'Crop recommendation successful',
        200
      );
    } catch (error) {
      Logger.error('Crop recommendation error', error.message);
      
      if (error.statusCode) {
        return ResponseHandler.sendError(res, error.message, error.statusCode);
      }
      
      ResponseHandler.sendError(res, 'Crop recommendation failed', 500);
    }
  }
};

module.exports = CropController;
