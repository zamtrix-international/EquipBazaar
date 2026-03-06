const { ApiError } = require("../utils/apiError");
const { logger } = require("../utils/logger");

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  logger.error("API Error", {
    statusCode,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
    details: err.details || null,
  });

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    details: err.details || null,
  });
}

module.exports = { notFoundHandler, errorHandler };