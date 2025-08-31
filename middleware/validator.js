const { body, validationResult, param, query } = require('express-validator');

/**
 * Validate request and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};


// User validation rules
const userValidationRules = {
  register: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required')
  ],
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

// Client validation rules
const clientValidationRules = {
  create: [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
    body('dob').optional().isDate().withMessage('Date of birth must be a valid date'),
    body('age').optional().isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120'),
    body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('education').optional().isString().withMessage('Education must be a string'),
    body('birth_place').optional().isString().withMessage('Birth place must be a string'),
    body('business_job_name').optional().isString().withMessage('Business/job name must be a string'),
    body('type_of_duty').optional().isString().withMessage('Type of duty must be a string'),
    body('anual_income').optional().isFloat({ min: 0 }).withMessage('Annual income must be a positive number'),
    body('pan_no').optional().isString().withMessage('PAN number must be a string'),
    body('marital_status').optional().isIn(['single', 'married', 'divorced', 'widowed']).withMessage('Invalid marital status'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('additional_info').optional().isString().withMessage('Additional info must be a string')
  ],
  update: [
    param('id').isUUID().withMessage('Valid client ID is required'),
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
    body('dob').optional().isDate().withMessage('Date of birth must be a valid date'),
    body('age').optional().isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120'),
    body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('education').optional().isString().withMessage('Education must be a string'),
    body('birth_place').optional().isString().withMessage('Birth place must be a string'),
    body('business_job_name').optional().isString().withMessage('Business/job name must be a string'),
    body('type_of_duty').optional().isString().withMessage('Type of duty must be a string'),
    body('anual_income').optional().isFloat({ min: 0 }).withMessage('Annual income must be a positive number'),
    body('pan_no').optional().isString().withMessage('PAN number must be a string'),
    body('marital_status').optional().isIn(['single', 'married', 'divorced', 'widowed']).withMessage('Invalid marital status'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('additional_info').optional().isString().withMessage('Additional info must be a string')
  ],
  getOne: [
    param('id').isUUID().withMessage('Valid client ID is required')
  ],
  delete: [
    param('id').isUUID().withMessage('Valid client ID is required')
  ],
  search: [
    query('search').optional().isString()
  ],
  addDocument: [
    param('id').isUUID().withMessage('Valid client ID is required'),
    body('document_type').notEmpty().withMessage('Document type is required')
      .isIn(['adhar card', 'pan card', 'driving license', 'mediclaim', 'rc book', 'other']).withMessage('Document type must be one of: adhar card, pan card, driving license, medi claim'),
    body('document_name').optional().isString().withMessage('Document name must be a string'),
    body('document_url').notEmpty().withMessage('Document URL is required')
  ],
  deleteDocument: [
    param('clientId').isUUID().withMessage('Valid client ID is required'),
    param('documentId').isUUID().withMessage('Valid document ID is required')
  ],
  uploadDocument: [
    param('id').isUUID().withMessage('Valid client ID is required'),
    body('document_type').notEmpty().withMessage('Document type is required')
      .isIn(['adhar card', 'pan card', 'driving license', 'mediclaim', 'rc book', 'other']).withMessage('Document type must be one of: adhar card, pan card, driving license, medi claim'),
    body('document_name').optional().isString().withMessage('Document name must be a string')
  ]
};

// Insurance validation rules
const insuranceValidationRules = {
  create: [
    body('client_id').isUUID().withMessage('Valid client ID is required'),
    body('policy_type_id').isUUID().withMessage('Valid policy type ID is required'),
    body('policy_number').notEmpty().withMessage('Policy number is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('premium_amount').isFloat({ min: 0 }).withMessage('Premium amount must be a positive number'),
    body('premium_due_date').isDate().withMessage('Valid premium due date is required')
  ],
  update: [
    param('id').isUUID().withMessage('Valid insurance ID is required'),
    body('client_id').optional().isUUID().withMessage('Valid client ID is required'),
    body('policy_type_id').optional().isUUID().withMessage('Valid policy type ID is required'),
    body('policy_number').optional().notEmpty().withMessage('Policy number cannot be empty'),
    body('start_date').optional().isDate().withMessage('Valid start date is required'),
    body('end_date').optional().isDate().withMessage('Valid end date is required'),
    body('premium_amount').optional().isFloat({ min: 0 }).withMessage('Premium amount must be a positive number'),
    body('premium_due_date').optional().isDate().withMessage('Valid premium due date is required'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
  ],
  getOne: [
    param('id').isUUID().withMessage('Valid insurance ID is required')
  ],
  delete: [
    param('id').isUUID().withMessage('Valid insurance ID is required')
  ]
};

// Notification validation rules
const notificationValidationRules = {
  sendWhatsApp: [
    body('client_id').isUUID().withMessage('Valid client ID is required'),
    body('message').notEmpty().withMessage('Message is required')
  ]
};

const updateProfileValidator = [
	body("name")
		.optional()
		.isString()
		.withMessage("Name must be a string")
		.isLength({ max: 100 })
		.withMessage("Name must be at most 100 characters")
		.trim()
		.escape(),

	body("email")
		.optional()
		.isEmail()
		.withMessage("Invalid email")
		.normalizeEmail(),

	body("phone")
		.optional()
		.isMobilePhone("any")
		.withMessage("Invalid phone number")
		.trim(),

	body("company_name")
		.optional()
		.isString()
		.withMessage("Company name must be a string")
		.isLength({ max: 100 })
		.withMessage("Company name must be at most 100 characters")
		.trim()
		.escape(),
];

module.exports = {
	validate,
	userValidationRules,
	clientValidationRules,
	insuranceValidationRules,
	notificationValidationRules,
	updateProfileValidator,
};