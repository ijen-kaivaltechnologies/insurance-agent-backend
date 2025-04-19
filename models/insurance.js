const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Insurance model for policy management
 */
class Insurance {
  /**
   * Create a new insurance policy
   * @param {Object} policyData - Policy data including user_id
   * @returns {Promise} - Promise with new policy data
   */
  static async create(policyData) {
    const {
      user_id,
      client_id,
      policy_type_id,
      policy_number,
      start_date,
      end_date,
      premium_amount,
      premium_due_date,
      is_active = true
    } = policyData;
    
    // Generate UUID
    const id = uuidv4();
    
    const query = `
      INSERT INTO insurances (
        id, user_id, client_id, policy_type_id, policy_number,
        start_date, end_date, premium_amount, premium_due_date, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      id, user_id, client_id, policy_type_id, policy_number,
      start_date, end_date, premium_amount, premium_due_date, is_active
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Find policy by ID (respecting user isolation)
   * @param {string} id - Policy ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with policy data or null
   */
  static async findById(id, userId) {
    const query = `
      SELECT 
        i.*,
        c.first_name, c.last_name, c.phone, c.email,
        pt.name as policy_type, pt.description as policy_description
      FROM insurances i
      JOIN clients c ON i.client_id = c.id
      JOIN policy_types pt ON i.policy_type_id = pt.id
      WHERE i.id = $1 AND i.user_id = $2
    `;
    
    const result = await db.query(query, [id, userId]);
    return result.rows[0] || null;
  }
  
  /**
   * Find all policies for a user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with array of policies
   */
  static async findAll(userId) {
    const query = `
      SELECT 
        i.*,
        c.first_name, c.last_name, c.phone, c.email,
        pt.name as policy_type
      FROM insurances i
      JOIN clients c ON i.client_id = c.id
      JOIN policy_types pt ON i.policy_type_id = pt.id
      WHERE i.user_id = $1
      ORDER BY i.premium_due_date, c.last_name
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
  
  /**
   * Find policies by client ID
   * @param {string} clientId - Client ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with array of policies
   */
  static async findByClientId(clientId, userId) {
    const query = `
      SELECT 
        i.*,
        pt.name as policy_type, pt.description as policy_description
      FROM insurances i
      JOIN policy_types pt ON i.policy_type_id = pt.id
      WHERE i.client_id = $1 AND i.user_id = $2
      ORDER BY i.premium_due_date
    `;
    
    const result = await db.query(query, [clientId, userId]);
    return result.rows;
  }
  
  /**
   * Update policy
   * @param {string} id - Policy ID
   * @param {string} userId - User ID (for isolation)
   * @param {Object} policyData - Policy data to update
   * @returns {Promise} - Promise with updated policy data
   */
  static async update(id, userId, policyData) {
    // Get fields to update
    const fields = Object.keys(policyData).filter(key => 
      key !== 'id' && key !== 'user_id' && policyData[key] !== undefined
    );
    
    if (fields.length === 0) {
      return await this.findById(id, userId);
    }
    
    // Build query
    let query = 'UPDATE insurances SET ';
    const values = [id, userId];
    
    fields.forEach((field, index) => {
      query += `${field} = $${index + 3}${index < fields.length - 1 ? ', ' : ' '}`;
      values.push(policyData[field]);
    });
    
    query += 'WHERE id = $1 AND user_id = $2 RETURNING *';
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Delete policy
   * @param {string} id - Policy ID
   * @param {string} userId - User ID (for isolation)
   * @returns {Promise<boolean>} - True if deleted
   */
  static async delete(id, userId) {
    const query = 'DELETE FROM insurances WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, userId]);
    
    return result.rowCount > 0;
  }
  
  /**
   * Find policies with upcoming premium due dates
   * @param {string} userId - User ID
   * @param {number} withinDays - Days until premium due
   * @returns {Promise} - Promise with array of policies
   */
  static async findUpcomingPremiums(userId, withinDays) {
    const query = `
      SELECT 
        i.*,
        c.first_name, c.last_name, c.phone, c.email,
        pt.name as policy_type
      FROM insurances i
      JOIN clients c ON i.client_id = c.id
      JOIN policy_types pt ON i.policy_type_id = pt.id
      WHERE 
        i.user_id = $1 
        AND i.is_active = true
        AND i.premium_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $2
      ORDER BY i.premium_due_date
    `;
    
    const result = await db.query(query, [userId, withinDays]);
    return result.rows;
  }
}

module.exports = Insurance;