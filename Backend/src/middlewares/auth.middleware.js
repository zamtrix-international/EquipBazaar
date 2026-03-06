const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/apiError");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, "Unauthorized: token missing"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    return next();
  } catch (err) {
    return next(new ApiError(401, "Unauthorized: invalid token"));
  }
}

module.exports = { auth };