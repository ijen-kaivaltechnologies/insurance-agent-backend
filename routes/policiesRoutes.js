const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const Policy = require("../models/policies");
const auth = require("../middleware/auth");
const upload = require("../utils/fileUpload");
const policyController = require("../controllers/policyController");
const path = require("path");
const fs = require("fs");

const env = require("../config/env");

const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

// Create new policy
router.post(
	"/",
	auth,
	async (req, res) => {
		try {
			const userId = req.user.id;

			// check if policy already exists
			const exists = await Policy.exists({
				where: {
					policy_num: req.body.policy_num,
					client_id: req.body.client_id,
				},
			});
			if (exists) {
				return res.status(400).json({
					success: false,
					message: "Policy with this policy number already exists",
				});
			}

			// check if client with same policy id exists
			const clientExists = await Policy.exists({
				where: {
					policy_type_id: req.body.policy_type_id,
					client_id: req.body.client_id,
				},
			});
			if (clientExists) {
				return res.status(400).json({
					success: false,
					message: "Client with this policy type id already exists",
				});
			}

			for (const key in Object.keys(req.body)) {
				if (typeof req.body[key] !== "string") {
					continue;
				}

				if (req.body[key].trim() === "") {
					req.body[key] = null;
				} else {
					req.body[key] = req.body[key].trim();
				}
			}

			const policy = await Policy.create({
				...req.body,
				user_id: userId,
			});

			res.status(201).json(policy);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
);

// Get all policies
router.get("/", auth, async (req, res) => {
	try {
		const filters = req.query;

		const policies = await Policy.getAll(filters);
		res.json(policies);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get policy by ID
router.get(
	"/:id",
	auth,
	param("id").notEmpty().withMessage("Policy ID is required"),
	handleValidationErrors,
	async (req, res) => {
		try {
			const policy = await Policy.getById(req.params.id);
			if (!policy) {
				return res.status(404).json({ message: "Policy not found" });
			}
			res.json(policy);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
);

// Update policy
router.put(
	"/:id",
	auth,
	param("id").notEmpty().withMessage("Policy ID is required"),
	handleValidationErrors,
	upload.fields([
		{ name: "adhar_card", maxCount: 1 },
		{ name: "pan_card", maxCount: 1 },
		{ name: "driving_licence", maxCount: 1 },
		{ name: "mediclaim", maxCount: 1 },
		{ name: "rc_book", maxCount: 1 },
		{ name: "other_file", maxCount: 1 },
		{ name: "policy_doc_path", maxCount: 1 },
	]),
	async (req, res) => {
		try {
			const existingPolicy = await Policy.getById(req.params.id);

			if (!existingPolicy) {
				return res.status(404).json({ message: "Policy not found" });
			}

			const filesToDelete = [];

			// file path to be saved in database
			const uploadedFileKeys = Object.keys(req.files);
			for (const fieldname of uploadedFileKeys) {
				const file = req.files[fieldname][0];
				const destination_path = file.path.split("uploads")[1];
				req.body[fieldname] = destination_path;

				existingPolicy[fieldname] &&
					filesToDelete.push(existingPolicy[fieldname]);
			}

			for (const key of Object.keys(req.body)) {
				if (typeof req.body[key] !== "string") {
					continue;
				}
				if (req.body[key].trim() === "") {
					req.body[key] = null;
				} else {
					req.body[key] = req.body[key].trim();
				}
			}

			const policy = await Policy.update(req.params.id, req.body);

			// delete files from uploads folder
			for (const file of filesToDelete) {
				const filePath = path.join(__dirname, "..", env.uploadsDir, file);

				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
					console.log(`File ${file} deleted successfully`);
				}
			}

			res.json(policy);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
);

// Delete policy
router.delete(
	"/:id",
	auth,
	param("id").notEmpty().withMessage("Policy ID is required"),
	handleValidationErrors,
	async (req, res) => {
		try {
			const result = await Policy.delete(req.params.id);
			if (!result) {
				return res.status(404).json({ message: "Policy not found" });
			}
			res.json({ message: "Policy deleted successfully" });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
);

// Import policies from CSV
router.post(
	"/import-csv",
	auth,
	upload.single("csv"),
	policyController.importPoliciesFromCsv
);

module.exports = router;
