const { ApiError } = require("../utils/apiError");

function rbac(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role) return next(new ApiError(401, "Unauthorized"));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: insufficient permissions"));
    }
    next();
  };
}

module.exports = { rbac };