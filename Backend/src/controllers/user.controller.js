/**
 * User Controller
 * Handles user-related HTTP requests
 */

const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Get user profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.status(200).json(new apiResponse(200, user, 'User profile retrieved'));
});

/**
 * Update user profile
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);
  res.status(200).json(new apiResponse(200, user, 'User profile updated'));
});

/**
 * Get all users (admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await userService.getAllUsers(page, limit);
  res.status(200).json(new apiResponse(200, result, 'Users retrieved'));
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
};
