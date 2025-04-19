const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * User model for handling authentication and user-related operations
 */
class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} - Promise with new user data
   */
  static async create(userData) {
    const { name, email, password, phone } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate UUID
    const id = uuidv4();
    
    const query = `
      INSERT INTO users (id, name, email, password, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, created_at
    `;
    
    const values = [id, name, email, hashedPassword, phone];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise} - Promise with user data or null
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    
    return result.rows[0] || null;
  }
  
  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise} - Promise with user data or null
   */
  static async findById(id) {
    const query = 'SELECT id, name, email, phone, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    return result.rows[0] || null;
  }
  
  /**
   * Verify password
   * @param {string} password - Plain password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} - True if password matches
   */
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} - Promise with updated user data
   */
  static async update(id, userData) {
    const { name, email, phone } = userData;
    
    const query = `
      UPDATE users
      SET name = $2, email = $3, phone = $4
      WHERE id = $1
      RETURNING id, name, email, phone, created_at, updated_at
    `;
    
    const values = [id, name, email, phone];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;