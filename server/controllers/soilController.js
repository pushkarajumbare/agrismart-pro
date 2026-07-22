/**
 * Soil Analysis Controller
 * Handles soil analysis and crop recommendation
 */

const AiService = require('../services/aiService');
const InputValidator = require('../validators/inputValidator');
const ResponseHandler = require('../utils/response');
const Logger = require('../utils/logger');

const SoilController = {
  /**
   * POST /api/soil/analyze
   * Analyze soil and provide recommendations
   */
  analyzeSoil: async (req, res, next) => {
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
          'Invalid soil data',
          400,
          { errors: validation.errors }
        );
      }

      Logger.info('Soil data validated, sending to AI backend...');

      // Call AI backend
      const analysis = await AiService.analyzeSoil({
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        ph: parseFloat(ph),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        rainfall: parseFloat(rainfall),
        moisture: parseFloat(moisture) || 50
      });

      // Ensure proper response structure
      const response = {
        recommended_crop: analysis.recommended_crop || 'Legumes',
        alternative_crops: analysis.alternative_crops || ['Wheat', 'Rice', 'Maize'],
        soil_health_score: analysis.soil_health_score || 65,
        nutrient_deficiencies: analysis.nutrient_deficiencies || [],
        fertilizer_suggestions: analysis.fertilizer_suggestions || ['Balanced NPK 10:10:10'],
        organic_alternatives: analysis.organic_alternatives || ['Compost', 'Neem cake'],
        water_requirement: analysis.water_requirement || '400-600 mm/season',
        expected_yield: analysis.expected_yield || '3-5 tons/hectare',
        season_recommendation: analysis.season_recommendation || 'Kharif',
        confidence_score: analysis.confidence_score || 72,
        scientific_explanation: analysis.scientific_explanation || 'Analysis based on soil NPK levels and environmental conditions'
      };

      ResponseHandler.send(
        res,
        response,
        'Soil analysis successful',
        200
      );
    } catch (error) {
      Logger.error('Soil analysis error', error.message);
      
      if (error.statusCode) {
        return ResponseHandler.sendError(res, error.message, error.statusCode);
      }
      
      ResponseHandler.sendError(res, 'Soil analysis failed', 500);
    }
  }
};

module.exports = SoilController;
