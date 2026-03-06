const { Booking, BookingStatusLog, Equipment, VendorProfile } = require("../models");
const { Op } = require("sequelize");
const ApiError = require("../utils/apiError");

const VALID_TRANSITIONS = {
  REQUESTED: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["PAID", "CANCELLED"],
  PAID: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["WORK_STARTED"],
  WORK_STARTED: ["DELIVERED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
};

const getAvailableEquipment = async (startDate, endDate) => {

  const booked = await Booking.findAll({
    where: {
      serviceDate: {
        [Op.between]: [startDate, endDate]
      },
      status: {
        [Op.notIn]: ["CANCELLED", "REJECTED"]
      }
    },
    attributes: ["equipmentId"]
  });

  const bookedIds = booked.map(b => b.equipmentId);

  return Equipment.findAll({
    where: {
      id: { [Op.notIn]: bookedIds },
      isActive: true
    }
  });
};

const getUserBookings = async (userId, role) => {

  if (role === "VENDOR") {

    const vendor = await VendorProfile.findOne({
      where: { userId }
    });

    if (!vendor) {
      throw new ApiError(404, "Vendor profile not found");
    }

    return Booking.findAll({
      where: { vendorId: vendor.id }
    });
  }

  return Booking.findAll({
    where: { customerId: userId }
  });
};

const updateBookingStatus = async (bookingId, newStatus) => {

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const allowed = VALID_TRANSITIONS[booking.status] || [];

  if (!allowed.includes(newStatus)) {
    throw new ApiError(400, `Invalid transition ${booking.status} → ${newStatus}`);
  }

  booking.status = newStatus;

  await booking.save();

  await BookingStatusLog.create({
    bookingId,
    status: newStatus
  });

  return booking;
};

module.exports = {
  getAvailableEquipment,
  getUserBookings,
  updateBookingStatus
};