const FileUploaded = require('../models/file_uploaded');
const env = require('../config/env');
const path = require('path');
const fs = require('fs');

// Create a new file record
exports.createFile = async (req, res) => {
  try {
    // Multer middleware should have attached req.file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (req.body.key !== env.uploadVerificationToken) {
      return res.status(401).json({ message: 'Unauthorized to upload file' });
    }

    const filePath = req.file.path;
    const file_name = req.file.filename;
    const relative_path = path.join(env.uploadsDir, req.file.path.split(env.uploadsDir)[1]);
    // Calculate md5
    const md5 = await FileUploaded.calculateMd5(filePath);
    // Check if md5 already exists
    const existing = await FileUploaded.findByMd5(md5);
    if (existing) {
      // Remove the uploaded duplicate file
      fs.unlink(filePath, () => {});
      return res.status(200).json(existing);
    }
    // Save record
    const file = await FileUploaded.create({ md5, relative_path, file_name });
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: 'Error uploading/creating file record', error: err.message });
  }
};

// Get a file record by md5
exports.getFile = async (req, res) => {
  try {
    const { md5 } = req.params;
    const file = await FileUploaded.findByMd5(md5);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching file', error: err.message });
  }
};

// Get all file records
exports.getAllFiles = async (req, res) => {
  try {
    const files = await FileUploaded.findAll();
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files', error: err.message });
  }
};

// Update a file record (only file_name and relative_path)
exports.updateFile = async (req, res) => {
  try {
    const { md5 } = req.params;
    const { file_name, relative_path } = req.body;
    const updated = await FileUploaded.update(md5, { file_name, relative_path });
    if (!updated) return res.status(404).json({ message: 'File not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating file', error: err.message });
  }
};

// Delete a file record
exports.deleteFile = async (req, res) => {
  try {
    const { md5 } = req.params;
    const deleted = await FileUploaded.delete(md5);
    if (deleted) {
      const filePath = path.join(deleted.relative_path);
      fs.unlink(filePath, () => {});
    }
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting file', error: err.message });
  }
};
