const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const env = require("../config/env");

const uploadVerificationToken = env.uploadVerificationToken;

if (!uploadVerificationToken) {
	throw new Error("UPLOAD_VERIFICATION_TOKEN is not defined in the env.");
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../" + env.uploadsDir);

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Create client-specific directory
		const clientDir = path.join(uploadsDir, req.user?.id || "temp");
		if (!fs.existsSync(clientDir)) {
			fs.mkdirSync(clientDir, { recursive: true });
		}
		cb(null, clientDir);
	},
	filename: function (req, file, cb) {
		// Generate unique filename with original extension
		const fileExt = path.extname(file.originalname);
		const fileName = `${uuidv4()}${fileExt}`;
		cb(null, fileName);
	},
});

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
	const ALLOWED_MIME_TYPES = [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"text/csv",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	];

	if (ALLOWED_MIME_TYPES.includes(file.mimetype?.trim().toLowerCase())) {
		cb(null, true);
	} else {
		cb(
			new Error(
				"Invalid file type. Only PDF, JPEG, PNG, xlsx and CSV files are allowed."
			),
			false
		);
	}
};

// Create multer upload instance
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 40 * 1024 * 1024, // 40MB max file size
	},
});

module.exports = upload;
