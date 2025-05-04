const Policy = require('../models/policies');
const { logger } = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');

/**
 * Import policies from CSV file
 * @param {Object} req - Express request object with CSV file
 * @param {Object} res - Express response object
 */
const importPoliciesFromCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    console.log('File received:', req.file.path);
    const records = [];
    const errors = [];
    const duplicates = [];
    
    // Read file content
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    console.log('File content read, first 100 chars:', fileContent.substring(0, 100));
    
    // Parse CSV content using Promise
    const rows = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
        comment: '#'
      }, (err, data) => {
        if (err) {
          console.error('CSV parsing error:', err);
          reject(err);
        } else {
          console.log('CSV parsed successfully, found rows:', data.length);
          resolve(data);
        }
      });
    });

    console.log('Total rows:', rows.length);

    for (const record of rows) {
      console.log('Processing record:', JSON.stringify(record, null, 2));
      
      try {
        // Check for duplicate policy by policy number
        const existingPolicy = await Policy.exists({ where: { policy_num: record.policy_num } });
        if (existingPolicy) {
          console.log('Duplicate policy number found:', record.policy_num);
          duplicates.push({
            data: record,
            existingPolicy: {
              id: existingPolicy.id,
              policy_num: existingPolicy.policy_num
            }
          });
          continue; // Skip this record
        }

        // Transform CSV data to match policy model
        const policyData = {
          client_id: record.client_id,
          user_id: req.user.id,
          policy_type_id: record.policy_type_id,
          insured_name: record.insured_name,
          sum_insured: parseFloat(record.sum_insured),
          policy_num: record.policy_num,
          start_date: record.start_date,
          end_date: record.end_date,
          term_year: parseInt(record.term_year),
          premium_pay_term: record.premium_pay_term,
          plan_name: record.plan_name,
          payment_mode: record.payment_mode,
          insurance_company_name: record.insurance_company_name,
          policy_type: record.policy_type,
          net_primium: parseFloat(record.net_primium),
          gst_percent: parseFloat(record.gst_percent),
          gst_2nd_year_percent: parseFloat(record.gst_2nd_year_percent) || null,
          gst_3rd_year_percent: parseFloat(record.gst_3rd_year_percent) || null,
          total_premium: parseFloat(record.total_premium),
          policy_doc_path: record.policy_doc_path ? path.join('uploads', record.policy_doc_path) : null,
          refer_name: record.refer_name || null,
          note: record.note || null,
          
          // Vehicle specific fields
          registration_rto: record.registration_rto || null,
          vehicle_type: record.vehicle_type || null,
          engine_number: record.engine_number || null,
          chassis_number: record.chassis_number || null,
          vehical_class: record.vehical_class || null,
          insurance_type: record.insurance_type || null,
          tp_premium: parseFloat(record.tp_premium) || null,
          gst_amount: parseFloat(record.gst_amount) || null,
          cng_value: parseFloat(record.cng_value) || null,
          manufacture_year: record.manufacture_year || null,
          ncb: record.ncb || null,
          model_variant: record.model_variant || null,

          // Document fields
          adhar_card: record.adhar_card ? path.join('uploads', record.adhar_card) : null,
          pan_card: record.pan_card ? path.join('uploads', record.pan_card) : null,
          driving_licence: record.driving_licence ? path.join('uploads', record.driving_licence) : null,
          mediclaim: record.mediclaim ? path.join('uploads', record.mediclaim) : null,
          rc_book: record.rc_book ? path.join('uploads', record.rc_book) : null,
          other_file: record.other_file ? path.join('uploads', record.other_file) : null,

          // Rider fields
          term_rider_amount: parseFloat(record.term_rider_amount) || null,
          term_rider_note: record.term_rider_note || null,
          critical_rider_amount: parseFloat(record.critical_rider_amount) || null,
          critical_rider_note: record.critical_rider_note || null,
          accident_rider_amount: parseFloat(record.accident_rider_amount) || null,
          accident_rider_note: record.accident_rider_note || null,
          pwb_rider_amount: parseFloat(record.pwb_rider_amount) || null,
          pwb_rider_note: record.pwb_rider_note || null,
          other_rider_amount: parseFloat(record.other_rider_amount) || null,
          other_rider_note: record.other_rider_note || null
        };

        // Validate required fields
        const requiredFields = [
          'client_id', 'policy_type_id', 'insured_name', 'sum_insured',
          'policy_num', 'start_date', 'end_date', 'term_year',
          'plan_name', 'payment_mode', 'insurance_company_name',
          'policy_type', 'net_primium', 'total_premium'
        ];

        const missingFields = requiredFields.filter(field => !policyData[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        console.log('Creating policy with data:', JSON.stringify(policyData, null, 2));
        // Create policy
        const policy = await Policy.create(policyData);
        console.log("Policy created successfully:", policy.id);
        records.push(policy);
      } catch (error) {
        console.error('Error creating policy:', error);
        errors.push({
          data: record,
          error: error.message
        });
      }
    }

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);
    console.log('Temporary file cleaned up');

    // Send final response
    const response = {
      success: true,
      created: records.length,
      failed: errors.length,
      skipped: duplicates.length,
      policies: records,
      errors: errors,
      duplicates: duplicates
    };
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('CSV import error:', error);
    // Clean up the temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Temporary file cleaned up after error');
      } catch (e) {
        console.error('Error deleting temporary file:', e);
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  importPoliciesFromCsv
};
