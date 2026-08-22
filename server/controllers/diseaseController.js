/**
 * Disease Detection Controller
 * Handles disease scanning and analysis endpoints
 */

const AiService = require('../services/aiService');
const ImageValidator = require('../validators/imageValidator');
const ResponseHandler = require('../utils/response');
const Logger = require('../utils/logger');
const DISEASE_DATABASE = require('../constants/diseases');

const DiseaseController = {
  /**
   * POST /api/disease/scan
   * Upload image and detect disease
   */
  scanImage: async (req, res, next) => {
    try {
      // Extract file from single upload or fields upload
      const file = req.file || req.files?.file?.[0] || req.files?.image?.[0];

      // Validate image file
      if (!file) {
        return ResponseHandler.sendError(res, 'No image file uploaded', 400);
      }

      const validation = ImageValidator.validateImage(file);
      if (!validation.valid) {
        return ResponseHandler.sendError(
          res,
          'Image validation failed',
          400,
          { errors: validation.errors }
        );
      }

      Logger.info('Image validation passed, sending to AI backend...');

      // Send to Python AI backend
      const prediction = await AiService.predictDisease(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Validate prediction structure
      if (!prediction || !prediction.disease) {
        return ResponseHandler.sendError(
          res,
          'Invalid prediction from AI service',
          503
        );
      }

      // Enhance prediction with disease database info
      const diseaseInfo = DISEASE_DATABASE[prediction.disease] || DISEASE_DATABASE['Healthy'];
      
      const enrichedResponse = {
        disease: prediction.disease,
        confidence: prediction.confidence || 0,
        severity: diseaseInfo.severity,
        description: `Detected plant condition: ${prediction.disease}`,
        symptoms: diseaseInfo.symptoms,
        causes: diseaseInfo.causes,
        treatment: {
          organic: diseaseInfo.organic_treatment,
          chemical: diseaseInfo.chemical_treatment
        },
        prevention: diseaseInfo.prevention,
        fertilizer_recommendation: diseaseInfo.fertilizer,
        pesticide_recommendation: diseaseInfo.pesticide,
        irrigation_advice: diseaseInfo.irrigation,
        recovery_time: diseaseInfo.recovery_time,
        suitable_weather: diseaseInfo.suitable_weather,
        confidence_explanation: `Confidence: ${prediction.confidence}% - ${
          prediction.confidence > 85 ? 'High confidence prediction'
          : prediction.confidence > 70 ? 'Good confidence prediction'
          : prediction.confidence > 50 ? 'Moderate confidence prediction'
          : 'Low confidence - consider taking another photo with better lighting'
        }`
      };

      ResponseHandler.send(
        res,
        enrichedResponse,
        'Disease detection successful',
        200
      );
    } catch (error) {
      Logger.error('Disease scan error', error.message);
      
      if (error.statusCode) {
        return ResponseHandler.sendError(res, error.message, error.statusCode);
      }
      
      ResponseHandler.sendError(res, 'Disease detection failed', 500);
    }
  }
};

module.exports = DiseaseController;
