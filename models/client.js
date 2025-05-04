const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Client model for managing insurance clients
 */
class Client {
  /**
   * Create a new client
   * @param {Object} clientData - Client data including user_id
   * @returns {Promise} - Promise with new client data
   */
  static async create(clientData) {
    const {
      user_id,
      first_name,
      middle_name,
      last_name,
      gender,
      dob,
      age,
      height,
      weight,
      education,
      birth_place,
      business_job_name,
      type_of_duty,
      anual_income,
      pan_no,
      marital_status,
      phone,
      email,
      address,
      additional_info,
      adhar_card,
      pan_card,
      driving_licence,
      mediclaim,
      rc_book,
      other_file
    } = clientData;
    
    // Generate UUID
    const id = uuidv4();
    
    const query = `
      INSERT INTO clients (
        id, user_id, first_name, middle_name, last_name, gender,
        dob, age, height, weight, education, birth_place, business_job_name, 
        type_of_duty, anual_income, pan_no, marital_status, phone,
        email, address, additional_info, adhar_card, pan_card, 
        driving_licence, mediclaim, rc_book, other_file
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *
    `;
    
    const values = [
      id, user_id, first_name, middle_name, last_name, gender,
      dob, age, height, weight, education, birth_place, business_job_name, 
      type_of_duty, anual_income, pan_no, marital_status, phone,
      email, address, additional_info, adhar_card, pan_card, 
      driving_licence, mediclaim, rc_book, other_file
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Find client by ID (respecting user isolation)
   * @param {string} id - Client ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with client data or null
   */
  static async findById(id, userId) {
    const query = `
      SELECT c.*
      FROM clients c
      WHERE c.id = $1 AND c.user_id = $2
    `;
    
    const result = await db.query(query, [id, userId]);
    return result.rows[0] || null;
  }
  
  /**
   * Find all clients for a user with optional filters
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (search)
   * @returns {Promise} - Promise with array of clients
   */
  static async findAll(userId, filters = {}) {
    const { search } = filters;
    
    let query = `
      SELECT c.*
      FROM clients c
      WHERE c.user_id = $1
    `;
    
    const queryParams = [userId];
    
    // Add search filter if provided
    if (search) {
      query += ` AND (c.first_name ILIKE $${queryParams.length + 1} 
                  OR c.last_name ILIKE $${queryParams.length + 1}
                  OR c.email ILIKE $${queryParams.length + 1}
                  OR c.phone ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const result = await db.query(query, queryParams);
    return result.rows;
  }
  
  /**
   * Update client
   * @param {string} id - Client ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} - Promise with updated client data
   */
  static async update(id, userId, updateData) {
    // Extract fields to update
    const {
      first_name,
      middle_name,
      last_name,
      gender,
      dob,
      age,
      height,
      weight,
      education,
      birth_place,
      business_job_name,
      type_of_duty,
      anual_income,
      pan_no,
      marital_status,
      phone,
      email,
      address,
      additional_info,
      adhar_card,
      pan_card,
      driving_licence,
      mediclaim,
      rc_book,
      other_file
    } = updateData;
    
    // Build update query
    let query = `UPDATE clients SET updated_at = CURRENT_TIMESTAMP`;
    const values = [];
    let paramCount = 1;
    
    // Add fields to update if they exist
    if (first_name !== undefined) {
      query += `, first_name = $${paramCount++}`;
      values.push(first_name);
    }
    
    if (middle_name !== undefined) {
      query += `, middle_name = $${paramCount++}`;
      values.push(middle_name);
    }
    
    if (last_name !== undefined) {
      query += `, last_name = $${paramCount++}`;
      values.push(last_name);
    }
    
    if (gender !== undefined) {
      query += `, gender = $${paramCount++}`;
      values.push(gender);
    }
    
    if (dob !== undefined) {
      query += `, dob = $${paramCount++}`;
      values.push(dob);
    }
    
    if (age !== undefined) {
      query += `, age = $${paramCount++}`;
      values.push(age);
    }
    
    if (height !== undefined) {
      query += `, height = $${paramCount++}`;
      values.push(height);
    }
    
    if (weight !== undefined) {
      query += `, weight = $${paramCount++}`;
      values.push(weight);
    }
    
    if (education !== undefined) {
      query += `, education = $${paramCount++}`;
      values.push(education);
    }
    
    if (birth_place !== undefined) {
      query += `, birth_place = $${paramCount++}`;
      values.push(birth_place);
    }
    
    if (business_job_name !== undefined) {
      query += `, business_job_name = $${paramCount++}`;
      values.push(business_job_name);
    }
    
    if (type_of_duty !== undefined) {
      query += `, type_of_duty = $${paramCount++}`;
      values.push(type_of_duty);
    }
    
    if (anual_income !== undefined) {
      query += `, anual_income = $${paramCount++}`;
      values.push(anual_income);
    }
    
    if (pan_no !== undefined) {
      query += `, pan_no = $${paramCount++}`;
      values.push(pan_no);
    }
    
    if (marital_status !== undefined) {
      query += `, marital_status = $${paramCount++}`;
      values.push(marital_status);
    }
    
    if (phone !== undefined) {
      query += `, phone = $${paramCount++}`;
      values.push(phone);
    }
    
    if (email !== undefined) {
      query += `, email = $${paramCount++}`;
      values.push(email);
    }
    
    if (address !== undefined) {
      query += `, address = $${paramCount++}`;
      values.push(address);
    }
    
    if (additional_info !== undefined) {
      query += `, additional_info = $${paramCount++}`;
      values.push(additional_info);
    }
    
    // Add document fields
    if (adhar_card !== undefined) {
      query += `, adhar_card = $${paramCount++}`;
      values.push(adhar_card);
    }
    
    if (pan_card !== undefined) {
      query += `, pan_card = $${paramCount++}`;
      values.push(pan_card);
    }
    
    if (driving_licence !== undefined) {
      query += `, driving_licence = $${paramCount++}`;
      values.push(driving_licence);
    }
    
    if (mediclaim !== undefined) {
      query += `, mediclaim = $${paramCount++}`;
      values.push(mediclaim);
    }
    
    if (rc_book !== undefined) {
      query += `, rc_book = $${paramCount++}`;
      values.push(rc_book);
    }
    
    if (other_file !== undefined) {
      query += `, other_file = $${paramCount++}`;
      values.push(other_file);
    }
    
    // Add WHERE clause
    query += ` WHERE id = $${paramCount++} AND user_id = $${paramCount++} RETURNING *`;
    values.push(id, userId);
    
    // Execute update
    const result = await db.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Delete client
   * @param {string} id - Client ID
   * @param {string} userId - User ID (for isolation)
   * @returns {Promise<boolean>} - True if deleted
   */
  static async delete(id, userId) {
    const query = 'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, userId]);
    
    return result.rowCount > 0;
  }
  
  /**
   * Find clients by policy type
   * @param {string} userId - User ID
   * @param {string} policyType - Policy type name (vehicle, health, life)
   * @returns {Promise} - Promise with array of clients
   */
  static async findByPolicyType(userId, policyType) {
    const query = `
      SELECT DISTINCT c.*
      FROM clients c
      INNER JOIN insurances i ON c.id = i.client_id
      INNER JOIN policy_types pt ON i.policy_type_id = pt.id
      WHERE c.user_id = $1 AND pt.name = $2
      ORDER BY c.created_at DESC
    `;
    
    const result = await db.query(query, [userId, policyType]);
    return result.rows;
  }
  
  /**
   * Find clients with upcoming premium payments
   * @param {string} userId - User ID
   * @param {number} withinDays - Days until premium due
   * @returns {Promise} - Promise with array of clients and their policies
   */
  static async findWithUpcomingPremiums(userId, withinDays) {
    const query = `
      SELECT 
        c.*, 
        i.id as insurance_id,
        i.policy_number,
        i.premium_amount,
        i.premium_due_date,
        pt.name as policy_type
      FROM clients c
      INNER JOIN insurances i ON c.id = i.client_id
      INNER JOIN policy_types pt ON i.policy_type_id = pt.id
      WHERE 
        c.user_id = $1 
        AND i.is_active = true
        AND i.premium_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $2
      ORDER BY i.premium_due_date ASC
    `;
    
    const result = await db.query(query, [userId, withinDays]);
    return result.rows;
  }

  static async exists({ where }) {
    const query = 'SELECT EXISTS (SELECT 1 FROM clients WHERE $1)';
    try {
      const result = await db.query(query, [where]);
      return result.rows[0].exists;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Client;