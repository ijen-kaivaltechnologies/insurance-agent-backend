const Client = require("../models/client");
const { logger } = require("../utils/logger");
const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse");
const env = require("../config/env");
const { getRelativePath } = require("../utils/helpers");

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
			middle_name: req.body.middle_name,
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
			anual_income: req.body.anual_income
				? parseFloat(req.body.anual_income)
				: null,
			pan_no: req.body.pan_no,
			marital_status: req.body.marital_status,
			phone: req.body.phone,
			email: req.body.email,
			address: req.body.address,
			additional_info: req.body.additional_info,
			user_id: req.user.id,

			adhar_card: null,
			pan_card: null,
			driving_licence: null,
			mediclaim: null,
			rc_book: null,
			other_file: null,
		};

		console.log(req.files);

		// check if client already exists
		const exists = await Client.exists({
			where: { email: req.body.email, user_id: req.user.id },
		});

		if (exists) {
			return res.status(400).json({
				success: false,
				message: "Client with this email already exists",
			});
		}

		// check if user with the phone exists
		const phoneExists = await Client.exists({
			where: { phone: req.body.phone, user_id: req.user.id },
		});
		if (phoneExists) {
			return res.status(400).json({
				success: false,
				message: "Client with this phone already exists",
			});
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
				clientData.driving_licence = getRelativePath(
					req.files.driving_licence[0].path
				);
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
			message: "Client created successfully",
			data: client,
		});
	} catch (error) {
		console.log(error);
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
				message: "Client not found",
			});
		}

		// Files were uploaded via multer middleware
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No files uploaded",
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
				mime_type: file.mimetype,
			};

			const document = await Client.addDocument(id, documentData);
			documents.push(document);
		}

		logger.info(
			`${documents.length} documents uploaded for client: ${id} by user ${req.user.id}`
		);

		res.status(201).json({
			success: true,
			message: `${documents.length} documents uploaded successfully`,
			data: documents,
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
		const clients = await Client.findAll(req.user.id, {
			search,
			city_id,
			state_id,
		});

		res.status(200).json({
			success: true,
			count: clients.length,
			data: clients,
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
				message: "Client not found",
			});
		}

		res.status(200).json({
			success: true,
			data: client,
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
		const exists = await Client.findById(req.params.id);

		if (!exists) {
			return res.status(404).json({
				success: false,
				message: "Client not found",
			});
		}

		const uploadedFileKeys = Object.keys(req.files);
		const filesToDelete = [];

		for (const fieldname of uploadedFileKeys) {
			const file = req.files[fieldname][0];
			const destination_path = file.path.split(env.uploadsDir)[1];
			req.body[fieldname] = destination_path;

			exists[fieldname] && filesToDelete.push(exists[fieldname]);
		}

		// Update client
		const updatedClient = await Client.update(req.params.id, req.body);

		logger.info(`Client updated: ${req.params.id} by user ${req.user.id}`);

		// Delete old files
		for (const file of filesToDelete) {
			const filePath = path.join(__dirname, "..", env.uploadsDir, file);
			if (fs.existsSync(filePath)) {
				logger.info(`Deleting file: ${filePath}`);
				fs.unlinkSync(filePath);
				logger.info(`File deleted: ${filePath}`);
			}
		}

		res.status(200).json({
			success: true,
			message: "Client updated successfully",
			data: updatedClient,
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
				message: "Client not found",
			});
		}

		logger.info(`Client deleted: ${req.params.id} by user ${req.user.id}`);

		res.status(200).json({
			success: true,
			message: "Client deleted successfully",
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
		if (!["vehicle", "health", "life"].includes(type)) {
			return res.status(400).json({
				success: false,
				message: "Invalid policy type. Must be vehicle, health, or life",
			});
		}

		const clients = await Client.findByPolicyType(req.user.id, type);

		res.status(200).json({
			success: true,
			count: clients.length,
			data: clients,
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
			data: clients,
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
				message: "Client not found",
			});
		}

		// Add document to client
		const documentData = {
			...req.body,
			client_id: id,
		};

		const document = await Client.addDocument(id, documentData);

		logger.info(`Document added to client: ${id} by user ${req.user.id}`);

		res.status(201).json({
			success: true,
			message: "Document added successfully",
			data: document,
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
				message: "Client not found",
			});
		}

		// Delete document
		const deleted = await Client.deleteDocument(documentId, clientId);

		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: "Document not found",
			});
		}

		logger.info(
			`Document deleted: ${documentId} from client ${clientId} by user ${req.user.id}`
		);

		res.status(200).json({
			success: true,
			message: "Document deleted successfully",
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
				message: "Client not found",
			});
		}

		// Get client documents
		const documents = await Client.getDocuments(id);

		res.status(200).json({
			success: true,
			count: documents.length,
			data: documents,
		});
	} catch (error) {
		logger.error(`Get client documents error: ${error.message}`);
		next(error);
	}
};

/**
 * Create multiple clients at once
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBulkClients = async (req, res) => {
	try {
		const { clients } = req.body;
		const createdClients = [];
		const errors = [];

		// Process each client
		for (const clientData of clients) {
			try {
				// Add user_id to client data
				const fullClientData = {
					...clientData,
					user_id: req.user.id,
				};

				// Create client
				const client = await Client.create(fullClientData);
				createdClients.push(client);
			} catch (error) {
				errors.push({
					data: clientData,
					error: error.message,
				});
			}
		}

		// Return results
		res.json({
			success: true,
			created: createdClients.length,
			failed: errors.length,
			clients: createdClients,
			errors: errors,
		});
	} catch (error) {
		console.error("Bulk client creation error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Import clients from CSV file
 * @param {Object} req - Express request object with CSV file
 * @param {Object} res - Express response object
 */
const importClientsFromCsv = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No CSV file uploaded" });
		}

		console.log("File received:", req.file.path);
		const records = [];
		const errors = [];
		const duplicates = [];

		// Read file content
		const fileContent = fs.readFileSync(req.file.path, "utf-8");
		console.log(
			"File content read, first 100 chars:",
			fileContent.substring(0, 100)
		);

		// Parse CSV content using Promise
		const rows = await new Promise((resolve, reject) => {
			parse(
				fileContent,
				{
					columns: true,
					skip_empty_lines: true,
					trim: true,
					cast: true,
					comment: "#",
				},
				(err, data) => {
					if (err) {
						console.error("CSV parsing error:", err);
						reject(err);
					} else {
						console.log("CSV parsed successfully, found rows:", data.length);
						resolve(data);
					}
				}
			);
		});

		console.log("Total rows:", rows.length);

		for (const record of rows) {
			console.log("Processing record:", JSON.stringify(record, null, 2));

			try {
				// Check for duplicate client
				const existingClient = await Client.exists({
					where: { email: record.email },
				});
				if (existingClient) {
					console.log("Duplicate email found:", record.email);
					duplicates.push({
						data: record,
						existingClient: {
							id: existingClient.id,
							email: existingClient.email,
							phone: existingClient.phone,
						},
					});
					continue; // Skip this record
				}

				const phoneExists = await Client.exists({
					where: { phone: record.phone },
				});
				if (phoneExists) {
					console.log("Duplicate phone found:", record.phone);
					duplicates.push({
						data: record,
						existingClient: {
							id: phoneExists.id,
							email: phoneExists.email,
							phone: phoneExists.phone,
						},
					});
					continue; // Skip this record
				}

				// validate phone and email using regex
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				const phoneRegex = /^\d{10}$/;
				if (!emailRegex.test(record.email) || !phoneRegex.test(record.phone)) {
					console.log("Invalid email or phone:", {
						email: record.email,
						phone: record.phone,
					});
					errors.push({
						data: record,
						error: "Invalid email or phone",
					});
					continue; // Skip this record
				}

				// Transform CSV data to match client model
				const clientData = {
					user_id: req.user.id,
					first_name: record.first_name,
					middle_name: record.middle_name || null,
					last_name: record.last_name,
					gender: record.gender,
					dob: record.dob,
					age: parseInt(record.age),
					height: parseFloat(record.height),
					weight: parseFloat(record.weight),
					education: record.education,
					birth_place: record.birth_place,
					business_job_name: record.business_job_name,
					type_of_duty: record.type_of_duty,
					anual_income: parseFloat(record.anual_income),
					pan_no: record.pan_no,
					marital_status: record.marital_status,
					phone: record.phone,
					email: record.email,
					address: record.address,
					additional_info: record.additional_info || null,
					adhar_card: record.adhar_card
						? path.join("uploads", record.adhar_card)
						: null,
					pan_card: record.pan_card
						? path.join("uploads", record.pan_card)
						: null,
					driving_licence: record.driving_licence
						? path.join("uploads", record.driving_licence)
						: null,
					mediclaim: record.mediclaim
						? path.join("uploads", record.mediclaim)
						: null,
					rc_book: record.rc_book ? path.join("uploads", record.rc_book) : null,
					other_file: record.other_file
						? path.join("uploads", record.other_file)
						: null,
				};

				console.log(
					"Creating client with data:",
					JSON.stringify(clientData, null, 2)
				);
				// Create client
				const client = await Client.create(clientData);
				console.log("Client created successfully:", client.id);
				records.push(client);
			} catch (error) {
				console.error("Error creating client:", error);
				errors.push({
					data: record,
					error: error.message,
				});
			}
		}

		// Clean up the temporary file
		fs.unlinkSync(req.file.path);
		console.log("Temporary file cleaned up");

		// Send final response
		const response = {
			success: true,
			created: records.length,
			failed: errors.length,
			skipped: duplicates.length,
			clients: records,
			errors: errors,
			duplicates: duplicates,
		};

		res.json(response);
	} catch (error) {
		console.error("CSV import error:", error);
		// Clean up the temporary file if it exists
		if (req.file && req.file.path) {
			try {
				fs.unlinkSync(req.file.path);
				console.log("Temporary file cleaned up after error");
			} catch (e) {
				console.error("Error deleting temporary file:", e);
			}
		}
		res.status(500).json({ error: "Internal server error" });
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
	getClientDocuments,
	createBulkClients,
	importClientsFromCsv,
};
