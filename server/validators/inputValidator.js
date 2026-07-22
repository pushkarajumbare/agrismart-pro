/**
 * Input Validation Functions
 * Validates all user inputs
 */

const InputValidator = {
  validateSoilData: (data) => {
    const errors = {};
    
    if (data.nitrogen !== undefined && (isNaN(data.nitrogen) || data.nitrogen < 0 || data.nitrogen > 200)) {
      errors.nitrogen = 'Nitrogen must be between 0-200';
    }
    
    if (data.phosphorus !== undefined && (isNaN(data.phosphorus) || data.phosphorus < 0 || data.phosphorus > 200)) {
      errors.phosphorus = 'Phosphorus must be between 0-200';
    }
    
    if (data.potassium !== undefined && (isNaN(data.potassium) || data.potassium < 0 || data.potassium > 200)) {
      errors.potassium = 'Potassium must be between 0-200';
    }
    
    if (data.ph !== undefined && (isNaN(data.ph) || data.ph < 0 || data.ph > 14)) {
      errors.ph = 'pH must be between 0-14';
    }
    
    if (data.temperature !== undefined && (isNaN(data.temperature) || data.temperature < -50 || data.temperature > 60)) {
      errors.temperature = 'Temperature must be between -50°C to 60°C';
    }
    
    if (data.humidity !== undefined && (isNaN(data.humidity) || data.humidity < 0 || data.humidity > 100)) {
      errors.humidity = 'Humidity must be between 0-100%';
    }
    
    if (data.rainfall !== undefined && (isNaN(data.rainfall) || data.rainfall < 0)) {
      errors.rainfall = 'Rainfall must be non-negative';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : null
    };
  },

  validateWeatherCity: (city) => {
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return { valid: false, error: 'City name is required' };
    }
    
    if (city.length > 100) {
      return { valid: false, error: 'City name is too long' };
    }
    
    return { valid: true };
  }
};

module.exports = InputValidator;
