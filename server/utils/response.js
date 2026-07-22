/**
 * Standardized API Response Handler
 * Ensures consistent response format across all endpoints
 */

const ResponseHandler = {
  success: (data, message = 'Success', statusCode = 200) => ({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  }),

  error: (message = 'Error', statusCode = 400, errors = null) => ({
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString()
  }),

  send: (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json(ResponseHandler.success(data, message, statusCode));
  },

  sendError: (res, message = 'Error', statusCode = 400, errors = null) => {
    res.status(statusCode).json(ResponseHandler.error(message, statusCode, errors));
  }
};

module.exports = ResponseHandler;
