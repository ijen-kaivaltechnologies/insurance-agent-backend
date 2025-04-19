const jwt = require('jsonwebtoken');
const User = require('../models/user');
const env = require('../config/env');
const { logger } = require('../utils/logger');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const register = async (req, res, next) => {
  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(req.body.email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create new user
    const newUser = await User.create(req.body);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );
    
    logger.info(`New user registered: ${newUser.email}`);
    
    // Return user data with token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );
    
    logger.info(`User logged in: ${user.email}`);
    
    // Return user data with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getProfile = async (req, res, next) => {
  try {
    // Get user from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return user data
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};