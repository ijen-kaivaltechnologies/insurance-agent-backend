const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Standard rate limiter for API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

/**
 * Stricter rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};