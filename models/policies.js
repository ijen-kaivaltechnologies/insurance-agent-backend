const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Policy model for managing insurance policies
 */
class Policy {
  /**
   * Create a new policy
   * @param {Object} policyData - Policy data
   * @returns {Promise} - Promise with new policy data
   */
  static async create(policyData) {
    const {
      client_id,
      user_id,
      policy_type_id,
      insured_name,
      sum_insured,
      policy_num,
      start_date,
      end_date,
      term_year,
      premium_pay_term,
      plan_name,
      payment_mode,
      insurance_company_name,
      policy_type,
      net_primium,
      gst_percent,
      gst_2nd_year_percent,
      gst_3rd_year_percent,
      total_premium,
      policy_doc_path,
      refer_name,
      note,
      adhar_card,
      pan_card,
      driving_licence,
      mediclaim,
      rc_book,
      other_file,
      term_rider_amount,
      term_rider_note,
      critical_rider_amount,
      critical_rider_note,
      accident_rider_amount,
      accident_rider_note,
      pwb_rider_amount,
      pwb_rider_note,
      other_rider_amount,
      other_rider_note,
      registration_rto,
      vehicle_type,
      engine_number,
      chassis_number,
      vehical_class,
      insurance_type,
      tp_premium,
      gst_amount,
      cng_value,
      manufacture_year,
      ncb,
      model_variant,
    } = policyData;

    const query = `
      INSERT INTO policies (
        client_id, user_id, policy_type_id, insured_name, sum_insured,
        policy_num, start_date, end_date, term_year, premium_pay_term,
        plan_name, payment_mode, insurance_company_name, policy_type,
        net_primium, gst_percent, gst_2nd_year_percent, gst_3rd_year_percent,
        total_premium, policy_doc_path, refer_name, note,
        registration_rto, vehicle_type, engine_number, chassis_number, vehical_class, insurance_type, tp_premium, gst_amount, cng_value, manufacture_year, ncb, model_variant, 
        adhar_card, pan_card, driving_licence, mediclaim, rc_book, other_file,
        term_rider_amount, term_rider_note, critical_rider_amount, critical_rider_note,
        accident_rider_amount, accident_rider_note, pwb_rider_amount, pwb_rider_note,
        other_rider_amount, other_rider_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
                $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50)
      RETURNING *
    `;

    const values = [
      client_id, user_id, policy_type_id, insured_name, sum_insured,
      policy_num, start_date, end_date, term_year, premium_pay_term,
      plan_name, payment_mode, insurance_company_name, policy_type,
      net_primium, gst_percent, gst_2nd_year_percent, gst_3rd_year_percent,
      total_premium, policy_doc_path, refer_name, note,
      registration_rto, vehicle_type, engine_number, chassis_number, vehical_class, insurance_type, tp_premium, gst_amount, cng_value, manufacture_year, ncb, model_variant, 
      adhar_card, pan_card, driving_licence, mediclaim, rc_book, other_file,
      term_rider_amount, term_rider_note, critical_rider_amount, critical_rider_note,
      accident_rider_amount, accident_rider_note, pwb_rider_amount, pwb_rider_note,
      other_rider_amount, other_rider_note
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all policies
   * @returns {Promise} - Promise with array of policies
   */
  static async getAll(filters = {}) {


    const user_id = filters.user_id;
    const client_id = filters.client_id;
    const policy_type_id = filters.policy_type_id;
    

    let query = 'SELECT * FROM policies';
    let params = [];

    if (user_id) {
      query += ' WHERE user_id = $1';
      params.push(user_id);
    }

    if (client_id) {
      query += ' AND client_id = $2';
      params.push(client_id);
    }

    if (policy_type_id) {
      query += ' AND policy_type_id = $3';
      params.push(policy_type_id);
    }

    query += ' ORDER BY created_at DESC';

    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get policy by ID
   * @param {number} id - Policy ID
   * @returns {Promise} - Promise with policy data
   */
  static async getById(id) {
    const query = 'SELECT * FROM policies WHERE id = $1';
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get policies by client ID
   * @param {string} clientId - Client UUID
   * @returns {Promise} - Promise with array of policies
   */
  static async getByClientId(clientId) {
    const query = 'SELECT * FROM policies WHERE client_id = $1 ORDER BY created_at DESC';
    try {
      const result = await db.query(query, [clientId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update policy
   * @param {number} id - Policy ID
   * @param {Object} updateData - Updated policy data
   * @returns {Promise} - Promise with updated policy data
   */
  static async update(id, updateData) {
    const fields = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(updateData);
    const query = `
      UPDATE policies 
      SET ${fields}
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete policy
   * @param {number} id - Policy ID
   * @returns {Promise} - Promise with deleted policy data
   */
  static async delete(id) {
    const query = 'DELETE FROM policies WHERE id = $1 RETURNING *';
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }


  static async exists({ where }) {
    const whereClause = Object.keys(where).map(key => `${key} = $${Object.keys(where).indexOf(key) + 1}`).join(' AND ');
    const query = `SELECT EXISTS (SELECT 1 FROM policies WHERE ${whereClause})`;
    try {
      const result = await db.query(query, Object.values(where));
      return result.rows[0].exists;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Policy;