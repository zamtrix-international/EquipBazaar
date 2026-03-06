const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const authService = require("../services/auth.service");

exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  return apiResponse(res, {
    status: 201,
    message: "Registered successfully",
    data: { user, token },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  return apiResponse(res, {
    status: 200,
    message: "Login successful",
    data: { user, token },
  });
});