/**
 * Booking Service
 * Handles core booking operations and lifecycle
 */

const Booking = require('../models/Booking');
const BookingStatusLog = require('../models/BookingStatusLog');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const apiError = require('../utils/apiError');
const { Op } = require('sequelize');

/**
 * Create booking
 */
const createBooking = async (bookingData) => {
  const booking = await Booking.create(bookingData);
  await BookingStatusLog.create({
    bookingId: booking.id,
    status: booking.status,
    reason: 'Booking created',
  });
  return booking;
};

/**
 * Get booking by ID
 */
const getBookingById = async (bookingId) => {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Equipment, as: 'equipment' },
      { model: User, as: 'customer' },
      { model: User, as: 'vendor' },
      { model: BookingStatusLog, as: 'statusLogs' },
    ],
  });
  if (!booking) {
    throw new apiError(404, 'Booking not found');
  }
  return booking;
};

/**
 * Get user bookings
 */
const getUserBookings = async (userId, role, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const where = role === 'VENDOR' ? { vendorId: userId } : { customerId: userId };
  return await Booking.findAndCountAll({
    where,
    offset,
    limit,
  });
};

/**
 * Update booking status
 */
const updateBookingStatus = async (bookingId, newStatus, reason = '') => {
  const booking = await getBookingById(bookingId);
  booking.status = newStatus;
  await booking.save();

  await BookingStatusLog.create({
    bookingId,
    status: newStatus,
    reason,
  });

  return booking;
};

/**
 * Get available equipment for date range
 */
const getAvailableEquipment = async (startDate, endDate, page = 1, limit = 10) => {
  // TODO: Filter equipment not booked for date range
  const offset = (page - 1) * limit;
  return await Equipment.findAndCountAll({
    where: { isActive: true },
    offset,
    limit,
  });
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  getAvailableEquipment,
};
