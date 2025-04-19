const Client = require('../models/client');
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
 * Create a new client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const createClient = async (req, res, next) => {
  try {
    // Extract client data from form fields
    const clientData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      dob: req.body.dob,
      age: req.body.age ? parseInt(req.body.age) : null,
      height: req.body.height ? parseFloat(req.body.height) : null,
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      education: req.body.education,
      birth_place: req.body.birth_place,
      business_job_name: req.body.business_job_name,
      type_of_duty: req.body.type_of_duty,
      anual_income: req.body.anual_income ? parseFloat(req.body.anual_income) : null,
      pan_no: req.body.pan_no,
      marital_status: req.body.marital_status,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      additional_info: req.body.additional_info,
      user_id: req.user.id
    };
    
    // Process uploaded documents if any
    if (req.body.document) {
      // Handle documents from the nested document object
      const documentFields = ['adhar_card', 'pan_card', 'driving_licence', 'mediclaim', 'rc_book', 'other_file'];
      
      for (const field of documentFields) {
        if (req.body.document[field]) {
          // If the document field is provided in the request
          const file = req.body.document[field];
          
          // If it's a file object from multer
          if (file.path) {
            clientData[field] = getRelativePath(file.path);
          }
        }
      }
    }
    
    // Also check for files uploaded via multer middleware
    if (req.files) {
      // Store file paths for each document type
      if (req.files.adhar_card && req.files.adhar_card.length > 0) {
        clientData.adhar_card = getRelativePath(req.files.adhar_card[0].path);
      }
      
      if (req.files.pan_card && req.files.pan_card.length > 0) {
        clientData.pan_card = getRelativePath(req.files.pan_card[0].path);
      }
      
      if (req.files.driving_licence && req.files.driving_licence.length > 0) {
        clientData.driving_licence = getRelativePath(req.files.driving_licence[0].path);
      }
      
      if (req.files.mediclaim && req.files.mediclaim.length > 0) {
        clientData.mediclaim = getRelativePath(req.files.mediclaim[0].path);
      }
      
      if (req.files.rc_book && req.files.rc_book.length > 0) {
        clientData.rc_book = getRelativePath(req.files.rc_book[0].path);
      }
      
      if (req.files.other_file && req.files.other_file.length > 0) {
        clientData.other_file = getRelativePath(req.files.other_file[0].path);
      }
    }
    
    // Create client
    const client = await Client.create(clientData);
    
    logger.info(`Client created: ${client.id} by user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    logger.error(`Create client error: ${error.message}`);
    next(error);
  }
};

/**
 * Upload document for a client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const uploadClientDocument = async (req, res, next) => {
  try {
    const { id } = req.params; // Client ID
    
    // Check if client exists and belongs to user
    const client = await Client.findById(id, req.user.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Files were uploaded via multer middleware
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    // Create document records for each file
    const documents = [];
    
    for (const file of req.files) {
      // Create document record
      const documentData = {
        client_id: id,
        document_type: req.body.document_type || null,
        document_name: req.body.document_name || file.originalname,
        document_url: getRelativePath(file.path),
        file_size: file.size,
        mime_type: file.mimetype
      };
      
      const document = await Client.addDocument(id, documentData);
      documents.push(document);
    }
    
    logger.info(`${documents.length} documents uploaded for client: ${id} by user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      message: `${documents.length} documents uploaded successfully`,
      data: documents
    });
  } catch (error) {
    logger.error(`Upload document error: ${error.message}`);
    next(error);
  }
};

/**
 * Get all clients for a user with optional filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getAllClients = async (req, res, next) => {
  try {
    const { search, city_id, state_id } = req.query;
    
    // Get clients with filters
    const clients = await Client.findAll(req.user.id, { search, city_id, state_id });
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    logger.error(`Get all clients error: ${error.message}`);
    next(error);
  }
};

/**
 * Get client by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id, req.user.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error(`Get client by ID error: ${error.message}`);
    next(error);
  }
};

/**
 * Update client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const updateClient = async (req, res, next) => {
  try {
    // Check if client exists
    const exists = await Client.findById(req.params.id, req.user.id);
    
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Update client
    const updatedClient = await Client.update(req.params.id, req.user.id, req.body);
    
    logger.info(`Client updated: ${req.params.id} by user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
    });
  } catch (error) {
    logger.error(`Update client error: ${error.message}`);
    next(error);
  }
};

/**
 * Delete client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const deleteClient = async (req, res, next) => {
  try {
    const result = await Client.delete(req.params.id, req.user.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    logger.info(`Client deleted: ${req.params.id} by user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete client error: ${error.message}`);
    next(error);
  }
};

/**
 * Get clients by policy type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getClientsByPolicyType = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    // Validate policy type
    if (!['vehicle', 'health', 'life'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy type. Must be vehicle, health, or life'
      });
    }
    
    const clients = await Client.findByPolicyType(req.user.id, type);
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    logger.error(`Get clients by policy type error: ${error.message}`);
    next(error);
  }
};

/**
 * Get clients with upcoming premium due dates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getClientsPremiumDue = async (req, res, next) => {
  try {
    const within = parseInt(req.query.within) || 7;
    
    const clients = await Client.findWithUpcomingPremiums(req.user.id, within);
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    logger.error(`Get clients premium due error: ${error.message}`);
    next(error);
  }
};

/**
 * Add document to client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const addClientDocument = async (req, res, next) => {
  try {
    const { id } = req.params; // Client ID
    
    // Check if client exists and belongs to user
    const client = await Client.findById(id, req.user.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Add document to client
    const documentData = {
      ...req.body,
      client_id: id
    };
    
    const document = await Client.addDocument(id, documentData);
    
    logger.info(`Document added to client: ${id} by user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Document added successfully',
      data: document
    });
  } catch (error) {
    logger.error(`Add document error: ${error.message}`);
    next(error);
  }
};

/**
 * Delete client document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const deleteClientDocument = async (req, res, next) => {
  try {
    const { clientId, documentId } = req.params;
    
    // Check if client exists and belongs to user
    const client = await Client.findById(clientId, req.user.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Delete document
    const deleted = await Client.deleteDocument(documentId, clientId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    logger.info(`Document deleted: ${documentId} from client ${clientId} by user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete document error: ${error.message}`);
    next(error);
  }
};

/**
 * Get client documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getClientDocuments = async (req, res, next) => {
  try {
    const { id } = req.params; // Client ID
    
    // Check if client exists and belongs to user
    const client = await Client.findById(id, req.user.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Get client documents
    const documents = await Client.getDocuments(id);
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    logger.error(`Get client documents error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createClient,
  uploadClientDocument,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientsByPolicyType,
  getClientsPremiumDue,
  addClientDocument,
  deleteClientDocument,
  getClientDocuments
};