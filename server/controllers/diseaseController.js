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

      // Enhance prediction with disease database info using flexible key matching
      const targetDisease = prediction.disease || 'Healthy';
      let diseaseInfo = DISEASE_DATABASE[targetDisease];

      if (!diseaseInfo) {
        if (targetDisease.toLowerCase().includes('late blight')) {
          diseaseInfo = DISEASE_DATABASE['Late Blight'];
        } else if (targetDisease.toLowerCase().includes('early blight')) {
          diseaseInfo = DISEASE_DATABASE['Early Blight'];
        } else if (targetDisease.toLowerCase().includes('spot')) {
          diseaseInfo = DISEASE_DATABASE['Leaf Spot'];
        } else {
          diseaseInfo = DISEASE_DATABASE['Healthy'];
        }
      }
      
      const enrichedResponse = {
        disease: prediction.disease,
        confidence: prediction.confidence || '90%',
        severity: diseaseInfo.severity || 'Medium',
        description: `Detected plant condition: ${prediction.disease}`,
        symptoms: prediction.symptoms || diseaseInfo.symptoms,
        cause: prediction.cause || diseaseInfo.causes,
        treatment: prediction.treatment || {
          organic: diseaseInfo.organic_treatment,
          chemical: diseaseInfo.chemical_treatment
        },
        prevention: prediction.prevention || diseaseInfo.prevention,
        fertilizer_recommendation: diseaseInfo.fertilizer,
        pesticide_recommendation: diseaseInfo.pesticide,
        irrigation_advice: diseaseInfo.irrigation,
        recovery_time: diseaseInfo.recovery_time,
        suitable_weather: diseaseInfo.suitable_weather,
        confidence_explanation: `Confidence: ${prediction.confidence || '90%'} - High confidence prediction`
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
