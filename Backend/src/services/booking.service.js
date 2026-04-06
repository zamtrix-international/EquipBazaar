/**
 * Booking Service
 */

const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

const Booking = require("../models/Booking");
const BookingStatusLog = require("../models/BookingStatusLog");
const DeliveryConfirmation = require("../models/DeliveryConfirmation");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const VendorProfile = require("../models/VendorProfile");

const walletService = require("./wallet.service");

const { ApiError } = require("../utils/apiError");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const { isValidTransition } = require("./bookingStatus.service");

function generateBookingCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK${datePart}${randPart}`;
}

/**
 * Resolve vendor profile id from vendor user id
 */
const resolveVendorProfileIdByUserId = async (userId) => {
  const vendorProfile = await VendorProfile.findOne({
    where: { userId },
  });

  if (!vendorProfile) {
    throw new ApiError(404, "Vendor profile not found");
  }

  return vendorProfile.id;
};

/**
 * Check if equipment already booked on date
 */
const checkDoubleBooking = async (
  equipmentId,
  serviceDate,
  excludeBookingId = null
) => {
  const where = {
    equipmentId,
    serviceDate,
    status: {
      [Op.notIn]: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED],
    },
  };

  if (excludeBookingId) {
    where.id = { [Op.ne]: excludeBookingId };
  }

  const existing = await Booking.findOne({ where });
  return !!existing;
};

/**
 * Create booking
 */
const createBooking = async (bookingData) => {
  return await sequelize.transaction(async (t) => {
    const alreadyBooked = await checkDoubleBooking(
      bookingData.equipmentId,
      bookingData.serviceDate
    );

    if (alreadyBooked) {
      throw new ApiError(409, "Equipment is already booked for this date");
    }

    let bookingCode;
    let attempts = 0;

    do {
      bookingCode = generateBookingCode();
      attempts++;

      if (attempts > 10) {
        throw new ApiError(500, "Could not generate booking code");
      }
    } while (
      await Booking.findOne({ where: { bookingCode }, transaction: t })
    );

    const initialStatus = bookingData.status || BOOKING_STATUS.REQUESTED;

    const booking = await Booking.create(
      {
        ...bookingData,
        bookingCode,
        status: initialStatus,
        requestedAt: new Date(),
      },
      { transaction: t }
    );

    await BookingStatusLog.create(
      {
        bookingId: booking.id,
        fromStatus: null,
        toStatus: booking.status,
        note: "Booking created",
        changedByUserId: booking.customerId,
      },
      { transaction: t }
    );

    return booking;
  });
};

/**
 * Get booking by id
 */
const getBookingById = async (bookingId) => {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Equipment, as: "equipment" },
      { model: User, as: "customer" },
      { model: VendorProfile, as: "vendor" },
      { model: BookingStatusLog, as: "statusLogs" },
      { model: DeliveryConfirmation, as: "deliveryConfirmation" },
    ],
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return booking;
};

/**
 * Get user bookings (customer / vendor / admin)
 */
const getUserBookings = async (userId, role, page = 1, limit = 10, status = null) => {
  page = Number(page);
  limit = Number(limit);

  const offset = (page - 1) * limit;

  let where = {};

  if (role === "VENDOR") {
    const vendorProfileId = await resolveVendorProfileIdByUserId(userId);
    where = { vendorId: vendorProfileId };
  } else if (role === "CUSTOMER") {
    where = { customerId: userId };
  }

  if (status && status !== 'all') {
    where.status = status.toUpperCase();
  }

  return await Booking.findAndCountAll({
    where,
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    include: [{ model: DeliveryConfirmation, as: "deliveryConfirmation" }],
  });
};

/**
 * Update booking status
 */
const updateBookingStatus = async (
  bookingId,
  newStatus,
  reason = "",
  changedByUserId = null
) => {
  return await sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(bookingId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (!isValidTransition(booking.status, newStatus)) {
      throw new ApiError(400, "Invalid booking status transition");
    }

    const now = new Date();
    const previousStatus = booking.status;

    booking.status = newStatus;

    if (newStatus === BOOKING_STATUS.ACCEPTED) {
      booking.acceptedAt = now;
    }

    if (newStatus === BOOKING_STATUS.DELIVERED) {
      booking.deliveredAt = now;
      booking.autoApproveAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // Create delivery confirmation record
      await DeliveryConfirmation.findOrCreate({
        where: { bookingId },
        defaults: {
          bookingId,
          returnDate: now,
          autoApproved: false,
          customerApproved: false,
        },
        transaction: t,
      });
    }

    if (newStatus === BOOKING_STATUS.COMPLETED) {
      booking.completedAt = now;
    }

    if (newStatus === BOOKING_STATUS.CANCELLED) {
      booking.cancelledAt = now;
    }

    await booking.save({ transaction: t });

    await BookingStatusLog.create(
      {
        bookingId,
        fromStatus: previousStatus,
        toStatus: newStatus,
        note: reason || null,
        changedByUserId,
      },
      { transaction: t }
    );

    // Credit vendor wallet only once, after booking is completed
    if (newStatus === BOOKING_STATUS.COMPLETED) {
      await walletService.creditBookingSettlement(
        booking.vendorId,
        booking.vendorNetAmount,
        booking.id,
        t
      );
    }

    return booking;
  });
};

/**
 * Get available equipment for date
 * TEMPORARY RULE:
 * - only isActive required
 * - isApproved filter removed
 */
const getAvailableEquipment = async (serviceDate, page = 1, limit = 10) => {
  page = Number(page);
  limit = Number(limit);

  const offset = (page - 1) * limit;

  const bookedOnDate = await Booking.findAll({
    attributes: ["equipmentId"],
    where: {
      serviceDate,
      status: {
        [Op.notIn]: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED],
      },
    },
    raw: true,
  });

  const bookedIds = bookedOnDate.map((b) => b.equipmentId);

  const whereClause = {
    isActive: true,
    ...(bookedIds.length > 0 ? { id: { [Op.notIn]: bookedIds } } : {}),
  };

  return await Equipment.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  getAvailableEquipment,
  checkDoubleBooking,
  resolveVendorProfileIdByUserId,
};