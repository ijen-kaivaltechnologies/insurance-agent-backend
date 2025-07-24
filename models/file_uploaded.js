const db = require('../config/db');

/**
 * Model for storing uploaded file metadata
 * Fields:
 *   md5 (primary key): MD5 hash of file
 *   relative_path: relative file path (e.g., 'uploads/filename.pdf')
 *   file_name: original file name
 *   uploaded_at: timestamp
 */
class FileUploaded {
  /**
   * Insert a new uploaded file record
   * @param {Object} fileData - { md5, relative_path, file_name }
   * @returns {Promise} - The inserted file record
   */
  static async create({ md5, relative_path, file_name }) {
    const query = `
      INSERT INTO file_uploaded (md5, relative_path, file_name, uploaded_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const values = [md5, relative_path, file_name];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Find a file by md5 hash
   * @param {string} md5
   * @returns {Promise} - File record or null
   */
  static async findByMd5(md5) {
    const query = 'SELECT * FROM file_uploaded WHERE md5 = $1';
    const { rows } = await db.query(query, [md5]);
    return rows[0] || null;
  }  /**
   * Find all file records
   * @returns {Promise} - Array of file records
   */
  static async findAll() {
    const query = 'SELECT * FROM file_uploaded ORDER BY uploaded_at DESC';
    const { rows } = await db.query(query);
    return rows;
  }

  /**
   * Update a file record (file_name, relative_path)
   * @param {string} md5
   * @param {Object} data - { file_name, relative_path }
   * @returns {Promise} - Updated file record or null
   */
  static async update(md5, data) {
    const fields = [];
    const values = [];
    let idx = 2;
    if (data.file_name !== undefined) {
      fields.push(`file_name = $${idx++}`);
      values.push(data.file_name);
    }
    if (data.relative_path !== undefined) {
      fields.push(`relative_path = $${idx++}`);
      values.push(data.relative_path);
    }
    if (fields.length === 0) return null;
    const query = `UPDATE file_uploaded SET ${fields.join(', ')} WHERE md5 = $1 RETURNING *`;
    const { rows } = await db.query(query, [md5, ...values]);
    return rows[0] || null;
  }

  /**
   * Delete a file record by md5 hash
   * @param {string} md5
   * @returns {Promise} - Deleted file record or null
   */
  static async delete(md5) {
    const file = await this.findByMd5(md5);
    if (!file) return null;
    const query = 'DELETE FROM file_uploaded WHERE md5 = $1 RETURNING *';
    await db.query(query, [md5]);
    return file;
  }

  /**
   * Calculate MD5 hash of a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - MD5 hash in hex
   */
  static async calculateMd5(filePath) {
    const fs = require('fs');
    const crypto = require('crypto');
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      stream.on('error', err => reject(err));
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }
}

module.exports = FileUploaded;
