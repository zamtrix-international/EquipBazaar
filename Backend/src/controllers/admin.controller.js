/**
 * Admin Controller
 * Handles admin dashboard operations
 */

const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');

/**
 * Get dashboard stats
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.count();
  const totalBookings = await Booking.count();
  const totalRevenue = await Payment.sum('amount', {
    where: { status: 'SUCCESS' },
  });

  const stats = {
    totalUsers,
    totalBookings,
    totalRevenue: totalRevenue || 0,
  };

  res.status(200).json(new apiResponse(200, stats, 'Dashboard stats retrieved'));
});

/**
 * Get pending approvals
 */
const getPendingApprovals = asyncHandler(async (req, res) => {
  const pendingBookings = await Booking.findAll({
    where: { status: 'PENDING' },
    limit: 20,
  });

  res.status(200).json(
    new apiResponse(200, pendingBookings, 'Pending approvals retrieved')
  );
});

/**
 * Get system logs
 */
const getSystemLogs = asyncHandler(async (req, res) => {
  // TODO: Implement log retrieval
  res.status(200).json(new apiResponse(200, [], 'System logs retrieved'));
});

module.exports = {
  getDashboardStats,
  getPendingApprovals,
  getSystemLogs,
};
