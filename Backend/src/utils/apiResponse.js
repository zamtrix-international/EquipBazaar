/**
 * Standard API response helpers.
 * Supports:
 * 1. res.status(code).json(new ApiResponse(code, data, message))
 * 2. apiResponse(res, { status, success, message, data, meta })
 * 3. const apiResponse = require(...) + new apiResponse(...)
 */

class ApiResponse {
  constructor(statusCode, data = null, message = "OK", meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (meta) {
      this.meta = meta;
    }
  }
}

// Legacy helper
function apiResponse(res, { status = 200, success = true, message = "OK", data = null, meta = null }) {
  const response = {
    success,
    message,
    data
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(status).json(response);
}

// Backward compatibility
apiResponse.ApiResponse = ApiResponse;
apiResponse.apiResponse = apiResponse;

module.exports = apiResponse;
module.exports.ApiResponse = ApiResponse;
module.exports.apiResponse = apiResponse;