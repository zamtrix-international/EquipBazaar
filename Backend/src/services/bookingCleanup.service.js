// services/bookingCleanup.service.js

const Booking = require("../models/Booking");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const { Op } = require("sequelize");

const cancelExpiredBookings = async () => {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 min

  const bookings = await Booking.findAll({
    where: {
      status: BOOKING_STATUS.PENDING_PAYMENT,
      createdAt: {
        [Op.lt]: cutoff,
      },
    },
  });

  for (const booking of bookings) {
    booking.status = BOOKING_STATUS.CANCELLED;
    await booking.save();
  }

  console.log(`Cancelled ${bookings.length} expired bookings`);
};

module.exports = { cancelExpiredBookings };