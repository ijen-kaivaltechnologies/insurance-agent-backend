const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Policy = require('../models/policies');
const auth = require('../middleware/auth');

// Validation middleware
const validatePolicy = [
  body('client_id').notEmpty().withMessage('Client ID is required'),
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('policy_type_id').notEmpty().withMessage('Policy type ID is required'),
  body('insured_name').notEmpty().withMessage('Insured name is required'),
  body('sum_insured').isNumeric().withMessage('Sum insured must be a number'),
  body('policy_num').notEmpty().withMessage('Policy number is required'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required'),
  body('term_year').isInt({ min: 1 }).withMessage('Valid term year is required'),
  body('premium_pay_term').isInt({ min: 1 }).withMessage('Valid premium pay term is required'),
  body('plan_name').notEmpty().withMessage('Plan name is required'),
  body('payment_mode').notEmpty().withMessage('Payment mode is required'),
  body('insurance_company_name').notEmpty().withMessage('Insurance company name is required'),
  body('policy_type').notEmpty().withMessage('Policy type is required'),
  body('net_primium').isNumeric().withMessage('Net premium must be a number'),
  body('total_premium').isNumeric().withMessage('Total premium must be a number'),
  body('vehicle_type').optional().isString().withMessage('Vehicle type must be a string if provided'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create new policy
router.post('/', 
  auth,
  validatePolicy,
  handleValidationErrors,
  async (req, res) => {
    try {
      const policy = await Policy.create(req.body);
      res.status(201).json(policy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all policies
router.get('/',
  auth,
  async (req, res) => {
    try {
      const policies = await Policy.getAll();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get policy by ID
router.get('/:id',
  auth,
  param('id').notEmpty().withMessage('Policy ID is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const policy = await Policy.getById(req.params.id);
      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update policy
router.put('/:id',
  auth,
  param('id').notEmpty().withMessage('Policy ID is required'),
  validatePolicy,
  handleValidationErrors,
  async (req, res) => {
    try {
      const policy = await Policy.update(req.params.id, req.body);
      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete policy
router.delete('/:id',
  auth,
  param('id').notEmpty().withMessage('Policy ID is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await Policy.delete(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      res.json({ message: 'Policy deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;