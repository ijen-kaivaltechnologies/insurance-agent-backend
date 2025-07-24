const express = require('express');
const router = express.Router();
const fileUploadController = require('../controllers/file-upload.controller');
const upload = require('../middleware/fileUpload');

// Upload a file
router.post('/upload', upload.single('file'), fileUploadController.createFile);

// Get a file by md5
router.get('/:md5', fileUploadController.getFile);

// Get all files
router.get('/', fileUploadController.getAllFiles);

// Update a file record (file_name, relative_path)
router.put('/:md5', fileUploadController.updateFile);

// Delete a file record
router.delete('/:md5', fileUploadController.deleteFile);

module.exports = router;
