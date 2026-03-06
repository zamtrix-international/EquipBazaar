function apiResponse(res, { status = 200, success = true, message = "OK", data = null, meta = null }) {
  return res.status(status).json({ success, message, data, meta });
}

module.exports = { apiResponse };