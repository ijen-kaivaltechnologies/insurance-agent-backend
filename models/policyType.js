const db = require('../config/db');

/**
 * PolicyType model for insurance policy types
 */
class PolicyType {
  /**
   * Find all policy types
   * @returns {Promise} - Promise with array of policy types
   */
  static async findAll() {
    const query = 'SELECT * FROM policy_types ORDER BY name';
    const result = await db.query(query);
    return result.rows;
  }
  
  /**
   * Find policy type by ID
   * @param {string} id - Policy type ID
   * @returns {Promise} - Promise with policy type data or null
   */
  static async findById(id) {
    const query = 'SELECT * FROM policy_types WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }
  
  /**
   * Find policy type by name
   * @param {string} name - Policy type name
   * @returns {Promise} - Promise with policy type data or null
   */
  static async findByName(name) {
    const query = 'SELECT * FROM policy_types WHERE name = $1';
    const result = await db.query(query, [name]);
    return result.rows[0] || null;
  }
}

module.exports = PolicyType;