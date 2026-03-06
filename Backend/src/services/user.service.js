/**
 * User Service
 * Handles user management operations
 */

const User = require('../models/User');
const apiError = require('../utils/apiError');

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new apiError(404, 'User not found');
  }
  return user;
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  const user = await getUserById(userId);
  await user.update(updateData);
  return user;
};

/**
 * Get all users (with pagination)
 */
const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  // TODO: Apply filters here
  return await User.findAndCountAll({
    offset,
    limit,
  });
};

module.exports = {
  getUserById,
  getUserByEmail,
  updateUserProfile,
  getAllUsers,
};
