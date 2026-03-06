/**
 * File Upload Utilities
 * Handles file upload operations, validations, and processing
 */

const path = require('path');
const fs = require('fs');

/**
 * Validate file upload
 * @param {Object} file - Express file object
 * @param {Array} allowedMimes - Allowed MIME types
 * @param {Number} maxSize - Max file size in bytes
 * @returns {Object} Validation result
 */
const validateFileUpload = (file, allowedMimes = [], maxSize = 10 * 1024 * 1024) => {
  if (!file) {
    return { valid: false, error: 'No file uploaded' };
  }

  if (allowedMimes.length > 0 && !allowedMimes.includes(file.mimetype)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedMimes.join(', ')}` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB` };
  }

  return { valid: true };
};

/**
 * Generate unique filename
 * @param {String} filename - Original filename
 * @returns {String} Unique filename
 */
const generateUniqueFilename = (filename) => {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${name}_${timestamp}_${random}${ext}`;
};

/**
 * Delete file safely
 * @param {String} filepath - Full path to file
 * @returns {Promise<Boolean>} True if deleted
 */
const deleteFile = async (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  validateFileUpload,
  generateUniqueFilename,
  deleteFile,
};
