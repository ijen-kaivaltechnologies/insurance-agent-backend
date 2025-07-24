const Policy = require('../models/policies');
const { logger } = require('../utils/logger');
const path = require('path');

/**
 * Get relative path from absolute path
 * @param {string} absolutePath - Absolute file path
 * @returns {string} - Relative file path
 */
const getRelativePath = (absolutePath) => {
  if (!absolutePath) return null;
  // Convert backslashes to forward slashes for consistency
  const normalizedPath = absolutePath.replace(/\\/g, '/');
  // Extract the path relative to the uploads directory
  const uploadsDirIndex = normalizedPath.indexOf('/uploads/');
  if (uploadsDirIndex !== -1) {
    return normalizedPath.substring(uploadsDirIndex + 1); // +1 to remove the leading slash
  }
  return normalizedPath;
};

/**
 * Create a new policy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const createPolicy = async (req, res, next) => {
  try {
    // Extract policy data from form fields
    const policyData = {
      client_id: req.body.client_id,
      user_id: req.user.id,
      policy_type_id: req.body.policy_type_id,
      insured_name: req.body.insured_name,
      sum_insured: req.body.sum_insured ? parseFloat(req.body.sum_insured) : null,
      policy_num: req.body.policy_num,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      term_year: req.body.term_year ? parseInt(req.body.term_year) : null,
      premium_pay_term: req.body.premium_pay_term ? parseFloat(req.body.premium_pay_term) : null,
      plan_name: req.body.plan_name,
      payment_mode: req.body.payment_mode,
      insurance_company_name: req.body.insurance_company_name,
      policy_type: req.body.policy_type,
      net_primium: req.body.net_primium ? parseFloat(req.body.net_primium) : null,
      gst_percent: req.body.gst_percent ? parseInt(req.body.gst_percent) : null,
      gst_2nd_year_percent: req.body.gst_2nd_year_percent ? parseInt(req.body.gst_2nd_year_percent) : null,
      gst_3rd_year_percent: req.body.gst_3rd_year_percent ? parseInt(req.body.gst_3rd_year_percent) : null,
      total_premium: req.body.total_premium ? parseFloat(req.body.total_premium) : null,
      refer_name: req.body.refer_name,
      note: req.body.note,
      // Rider information
      term_rider_amount: req.body.term_rider_amount ? parseFloat(req.body.term_rider_amount) : null,
      term_rider_note: req.body.term_rider_note,
      critical_rider_amount: req.body.critical_rider_amount ? parseFloat(req.body.critical_rider_amount) : null,
      critical_rider_note: req.body.critical_rider_note,
      accident_rider_amount: req.body.accident_rider_amount ? parseFloat(req.body.accident_rider_amount) : null,
      accident_rider_note: req.body.accident_rider_note,
      pwb_rider_amount: req.body.pwb_rider_amount ? parseFloat(req.body.pwb_rider_amount) : null,
      pwb_rider_note: req.body.pwb_rider_note,
      other_rider_amount: req.body.other_rider_amount ? parseFloat(req.body.other_rider_amount) : null,
      other_rider_note: req.body.other_rider_note,
      // New vehicle and insurance fields
      registration_rto: req.body.registration_rto,
      vehicle_type: req.body.vehicle_type,
      engine_number: req.body.engine_number,
      chassis_number: req.body.chassis_number,
      vehical_class: req.body.vehical_class,
      insurance_type: req.body.insurance_type,
      tp_premium: req.body.tp_premium ? parseFloat(req.body.tp_premium) : null,
      gst_amount: req.body.gst_amount ? parseFloat(req.body.gst_amount) : null,
      cng_value: req.body.cng_value ? parseFloat(req.body.cng_value) : null,
      manufacture_year: req.body.manufacture_year ? parseInt(req.body.manufacture_year) : null,
      ncb: req.body.ncb ? parseFloat(req.body.ncb) : null,
      model_variant: req.body.model_variant,


      // files
      adhar_card: req.body.adhar_card,
      pan_card: req.body.pan_card,
      driving_licence: req.body.driving_licence,
      mediclaim: req.body.mediclaim,
      rc_book: req.body.rc_book,
      other_file: req.body.other_file,
      policy_doc_path: req.body.policy_doc_path,
    };

    const policy = await Policy.create(policyData);
    logger.info(`Policy created with ID: ${policy.id}`);
    res.status(201).json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Error creating policy:', error);
    next(error);
  }
};

/**
 * Get all policies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getAllPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.getAll();
    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    logger.error('Error getting policies:', error);
    next(error);
  }
};

/**
 * Get policy by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getPolicyById = async (req, res, next) => {
  try {
    const policy = await Policy.getById(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Error getting policy:', error);
    next(error);
  }
};

/**
 * Get policies by client ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getPoliciesByClientId = async (req, res, next) => {
  try {
    const policies = await Policy.getByClientId(req.params.clientId);
    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    logger.error('Error getting client policies:', error);
    next(error);
  }
};

/**
 * Update policy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const updatePolicy = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id; // Remove id from update data if present

    // Handle file uploads
    if (req.files) {
      // Main policy document
      if (req.files.policy_doc && req.files.policy_doc.length > 0) {
        updateData.policy_doc_path = getRelativePath(req.files.policy_doc[0].path);
      }

      // Additional documents
      const documentFields = ['adhar_card', 'pan_card', 'driving_licence', 'mediclaim', 'rc_book', 'other_file'];
      for (const field of documentFields) {
        if (req.files[field] && req.files[field].length > 0) {
          updateData[field] = getRelativePath(req.files[field][0].path);
        }
      }
    }

    const policy = await Policy.update(req.params.id, updateData);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Error updating policy:', error);
    next(error);
  }
};

/**
 * Delete policy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const deletePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.delete(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Error deleting policy:', error);
    next(error);
  }
};

module.exports = {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  getPoliciesByClientId,
  updatePolicy,
  deletePolicy
};