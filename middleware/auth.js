const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { logger } = require('../utils/logger');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided' 
    });
  }

  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);
    
    // Attach user to request
    req.user = decoded;
    
    // Continue to next middleware
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

module.exports = authMiddleware;