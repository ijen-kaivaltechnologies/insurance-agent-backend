const Policy = require('../models/policies');
const Client = require("../models/client");
const PolicyTypes = require('../models/policyType');
const { parseInputFile, cleanValue } = require('../utils/helpers');

const path = require('path');
const fs = require('fs');

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

    const policy_type_id = parseInt(req.params.policy_type_id);
    const user_id = req.user.id;

    const allPolicies = await PolicyTypes.findAll()

    const policyTypeData = allPolicies.find(p => p?.id === policy_type_id)

    if (!policyTypeData) {
      res.status(500).json({ error: "invalid policy type id" });
      return
    }

    console.log('File received:', req.file.path);
    const records = [];
    const errors = [];
    const duplicates = [];
    
    // Parse CSV content using Promise
    const rows = await parseInputFile(req.file.path);
    console.log('Total rows:', rows.length);

    for (const record of rows) {
      console.log('Processing record:', JSON.stringify(record, null, 2));
      
      const policyNumber = cleanValue(record.policy_num);
      const clientPhone = cleanValue(record.client_phone);

      const clientData = await Client.getClientByPhoneAndUserId(clientPhone, user_id);

      if(!clientData){
        errors.push({
					data: {
						clientPhone,
					},
					error: "Client not found!!",
				});
        continue
      }

      const clientId = clientData.id


      try {
        // Check for duplicate policy by policy number
        const existingPolicy = await Policy.exists({ where: { policy_num: policyNumber, client_id: clientId } });
        if (existingPolicy) {
          console.log('Duplicate policy number found:', policyNumber);
          duplicates.push({
            data: record,
            existingPolicy: {
              id: existingPolicy.id,
              policy_num: existingPolicy.policy_num
            },
            message:"duplicate policy number for same client"
          });
          continue; // Skip this record
        }

        // Check for duplicate policy by policy number
        const existingPolicyType = await Policy.exists({
					where: { policy_type_id, client_id: clientId },
				});

        if (existingPolicyType) {
          console.log("Duplicate policy type found:", policy_type_id);
          duplicates.push({
						data: record,
						existingPolicy: {
							id: existingPolicy.id,
							policy_type_id,
						},
            message:"duplicate policy type id"
					});
          continue; // Skip this record
        }

				// Transform CSV/Excel data to match policy model
				const policyData = {
					client_id: clientId,
					user_id: req.user.id,
					policy_type_id: policy_type_id,
					insured_name: cleanValue(record.insured_name),
					sum_insured: cleanValue(record.sum_insured),
					policy_num: cleanValue(record.policy_num),
					start_date: cleanValue(record.start_date),
					end_date: cleanValue(record.end_date),
					term_year: cleanValue(record.term_year),
					premium_pay_term: cleanValue(record.premium_pay_term),
					plan_name: cleanValue(record.plan_name),
					payment_mode: cleanValue(record.payment_mode),
					insurance_company_name: cleanValue(record.insurance_company_name),
					policy_type: cleanValue(record.policy_type),
					net_primium: cleanValue(record.net_primium),
					gst_percent: cleanValue(record.gst_percent),
					gst_2nd_year_percent: cleanValue(record.gst_2nd_year_percent),
					gst_3rd_year_percent: cleanValue(record.gst_3rd_year_percent),
					total_premium: cleanValue(record.total_premium),
					policy_doc_path: cleanValue(record.policy_doc_path),
					refer_name: cleanValue(record.refer_name),
					note: cleanValue(record.note),

					// Vehicle specific fields
					registration_rto: cleanValue(record.registration_rto),
					vehicle_type: cleanValue(record.vehicle_type),
					engine_number: cleanValue(record.engine_number),
					chassis_number: cleanValue(record.chassis_number),
					vehical_class: cleanValue(record.vehical_class),
					insurance_type: cleanValue(record.insurance_type),
					tp_premium: cleanValue(record.tp_premium),
					gst_amount: cleanValue(record.gst_amount),
					cng_value: cleanValue(record.cng_value),
					manufacture_year: cleanValue(record.manufacture_year),
					ncb: cleanValue(record.ncb),
					model_variant: cleanValue(record.model_variant),

					// Document fields
					adhar_card: cleanValue(record.adhar_card),
					pan_card: cleanValue(record.pan_card),
					driving_licence: cleanValue(record.driving_licence),
					mediclaim:cleanValue(record.mediclaim),
					rc_book: cleanValue(record.rc_book),
					other_file: cleanValue(record.other_file),

					// Rider fields
					term_rider_amount: cleanValue(record.term_rider_amount),
					term_rider_note: cleanValue(record.term_rider_note),
					critical_rider_amount: cleanValue(record.critical_rider_amount),
					critical_rider_note: cleanValue(record.critical_rider_note),
					accident_rider_amount: cleanValue(record.accident_rider_amount),
					accident_rider_note: cleanValue(record.accident_rider_note),
					pwb_rider_amount: cleanValue(record.pwb_rider_amount),
					pwb_rider_note: cleanValue(record.pwb_rider_note),
					other_rider_amount: cleanValue(record.other_rider_amount),
					other_rider_note: cleanValue(record.other_rider_note),
				};


        // Validate required fields
        const requiredFields = [
          'client_id', 'insured_name', 'sum_insured',
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
