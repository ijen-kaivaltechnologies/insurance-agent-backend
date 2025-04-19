const { logger } = require('../utils/logger');
const env = require('../config/env');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Set status code
  const statusCode = err.statusCode || 500;
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only include stack trace in development
    ...(env.nodeEnv === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;