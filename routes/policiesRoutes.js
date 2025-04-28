const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Policy = require('../models/policies');
const auth = require('../middleware/auth');
const upload = require("../utils/fileUpload");

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
  upload.fields([
    { name: 'adhar_card', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 },
    { name: 'driving_licence', maxCount: 1 },
    { name: 'mediclaim', maxCount: 1 },
    { name: 'rc_book', maxCount: 1 },
    { name: 'other_file', maxCount: 1 },
    { name: 'policy_doc_path', maxCount: 1 }
  ]),
  async (req, res) => {
    try {

      const userId = req.user.id;
      const policy = await Policy.create({
        ...req.body,
        user_id: userId
      });
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