/**
 * Error Handling Middleware
 * Catches and formats errors consistently
 */

const Logger = require('../utils/logger');
const ResponseHandler = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  Logger.error('Unhandled Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  ResponseHandler.sendError(res, message, statusCode, {
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
