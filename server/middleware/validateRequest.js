/**
 * Request Validation Middleware
 * Validates all incoming requests
 */

const Logger = require('../utils/logger');
const ResponseHandler = require('../utils/response');

const validateRequest = (req, res, next) => {
  // Log all requests
  Logger.debug(`${req.method} ${req.path} - ${JSON.stringify(req.body).substring(0, 100)}`);
  
  // Check for malicious content patterns
  const checkMalicious = (obj) => {
    if (typeof obj !== 'object') return false;
    
    const stringified = JSON.stringify(obj).toLowerCase();
    const maliciousPatterns = ['<script', 'onclick=', 'onerror=', 'eval(', 'exec('];
    
    return maliciousPatterns.some(pattern => stringified.includes(pattern));
  };
  
  if (checkMalicious(req.body) || checkMalicious(req.query)) {
    Logger.warn('Potential malicious input detected');
    return ResponseHandler.sendError(res, 'Invalid input detected', 400);
  }
  
  next();
};

module.exports = validateRequest;
