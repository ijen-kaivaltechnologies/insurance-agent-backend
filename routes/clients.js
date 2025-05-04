const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Client = require('../models/client');
const auth = require('../middleware/auth');

// Validation middleware for bulk client creation
const validateBulkClients = [
  body('clients').isArray().withMessage('Clients must be an array'),
  body('clients.*.first_name').notEmpty().trim().withMessage('First name is required'),
  body('clients.*.last_name').notEmpty().trim().withMessage('Last name is required'),
  body('clients.*.gender').notEmpty().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('clients.*.dob').notEmpty().isDate().withMessage('Valid date of birth is required'),
  body('clients.*.age').isInt({ min: 0 }).withMessage('Valid age is required'),
  body('clients.*.height').isFloat({ min: 0 }).withMessage('Valid height is required'),
  body('clients.*.weight').isFloat({ min: 0 }).withMessage('Valid weight is required'),
  body('clients.*.education').notEmpty().trim().withMessage('Education is required'),
  body('clients.*.birth_place').notEmpty().trim().withMessage('Birth place is required'),
  body('clients.*.business_job_name').notEmpty().trim().withMessage('Business/job name is required'),
  body('clients.*.type_of_duty').notEmpty().trim().withMessage('Type of duty is required'),
  body('clients.*.anual_income').isFloat({ min: 0 }).withMessage('Valid annual income is required'),
  body('clients.*.pan_no').notEmpty().trim().withMessage('PAN number is required'),
  body('clients.*.marital_status').notEmpty().isIn(['single', 'married', 'divorced', 'widowed']).withMessage('Valid marital status is required'),
  body('clients.*.phone').notEmpty().trim().withMessage('Phone number is required'),
  body('clients.*.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('clients.*.address').notEmpty().trim().withMessage('Address is required')
];

/**
 * POST /api/clients/bulk
 * Create multiple clients at once
 */
router.post('/bulk', auth, validateBulkClients, async (req, res) => {
  try {
    // Check for validation errors
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { clients } = req.body;
    const createdClients = [];
    const validationFailedClients = [];

    // Process each client
    for (const clientData of clients) {
      try {
        // Add user_id to client data
        const fullClientData = {
          ...clientData,
          user_id: req.user.id
        };

        // Create client
        const client = await Client.create(fullClientData);
        createdClients.push(client);
      } catch (error) {
        validationFailedClients.push({
          data: clientData,
          error: error.message
        });
      }
    }

    // Return results
    res.json({
      success: true,
      created: createdClients.length,
      failed: validationFailedClients.length,
      clients: createdClients,
      errors: validationFailedClients
    });

  } catch (error) {
    console.error('Bulk client creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
