class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode || 500;
    this.details = details || null;
  }
}

module.exports = ApiError;
module.exports.ApiError = ApiError;
