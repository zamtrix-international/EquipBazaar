/**
 * File Upload Utilities
 * Handles file upload operations, validations, and processing
 */
const path = require("path");
const fs = require("fs");

/**
 * Validate file upload
 * @param {Object} file
 * @param {Array} allowedMimes
 * @param {Number} maxSize
 * @returns {Object}
 */
const validateFileUpload = (
  file,
  allowedMimes = [],
  maxSize = 10 * 1024 * 1024
) => {
  if (!file) {
    return { valid: false, error: "No file uploaded" };
  }

  if (allowedMimes.length > 0 && !allowedMimes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedMimes.join(", ")}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
};

/**
 * Create a safe filename
 * @param {String} filename
 * @returns {String}
 */
const safeFileName = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const name = path.basename(filename, ext);

  const sanitizedBase = name
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `${sanitizedBase || "file"}_${timestamp}_${random}${ext}`;
};

/**
 * Generate unique filename
 * @param {String} filename
 * @returns {String}
 */
const generateUniqueFilename = (filename) => safeFileName(filename);

/**
 * Delete file safely
 * @param {String} filepath
 * @returns {Promise<boolean>}
 */
const deleteFile = async (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

module.exports = {
  validateFileUpload,
  safeFileName,
  generateUniqueFilename,
  deleteFile,
};
