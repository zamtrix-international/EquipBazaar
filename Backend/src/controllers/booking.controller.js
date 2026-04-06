/**
 * Booking Controller
 */

const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const bookingService = require("../services/booking.service");
const bookingStatusService = require("../services/bookingStatus.service");
const bookingPricingService = require("../services/bookingPricing.service");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const VendorProfile = require("../models/VendorProfile");

const createBooking = asyncHandler(async (req, res) => {
  const {
    equipmentId,
    vendorId,
    estimatedHours,
    serviceDate,
    startDate,
    endDate,
    days,
    startTime,
    locationText,
    city,
    notes,
    estimatedKm,
  } = req.body;

  if (!equipmentId) {
    throw new ApiError(400, "equipmentId is required");
  }

  const normalizedServiceDate = serviceDate || startDate;

  if (!normalizedServiceDate) {
    throw new ApiError(400, "serviceDate or startDate is required");
  }

  if (!locationText || !String(locationText).trim()) {
    throw new ApiError(400, "locationText is required");
  }

  const pricing = await bookingPricingService.calculateBookingPrice(
    equipmentId,
    estimatedHours,
    vendorId
  );

  const extraCharges = bookingPricingService.calculateKmCharges(
    { kmRate: pricing.kmRate || 0 },
    estimatedKm
  );

  const bookingData = {
    equipmentId,
    vendorId: pricing.vendorId,
    customerId: req.user.id,
    serviceDate: normalizedServiceDate,
    startDate: startDate || normalizedServiceDate,
    endDate: endDate || null,
    days: days || null,
    startTime: startTime || null,
    estimatedHours: pricing.estimatedHours,
    estimatedKm: estimatedKm || null,
    locationText: String(locationText).trim(),
    city: city ? String(city).trim() : "Meerut",
    notes: notes ? String(notes).trim() : null,
    subtotal: pricing.basePrice,
    extraCharges,
    totalAmount: parseFloat((pricing.basePrice + extraCharges).toFixed(2)),
    commissionPct: pricing.commissionPct,
    commissionAmount: pricing.commissionAmount,
    vendorNetAmount: pricing.vendorNetAmount,

    // ✅ UPDATED (payment flow)
    status: BOOKING_STATUS.PENDING_PAYMENT,
  };

  const booking = await bookingService.createBooking(bookingData);

  res.status(201).json(new ApiResponse(201, booking, "Booking created"));
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);

  const isAdmin = req.user.role === "ADMIN";
  const isCustomer = booking.customerId === req.user.id;

  let isVendor = false;
  if (req.user.role === "VENDOR") {
    const vendorProfile = await VendorProfile.findOne({
      where: { userId: req.user.id },
    });
    isVendor = !!vendorProfile && booking.vendorId === vendorProfile.id;
  }

  if (!isAdmin && !isCustomer && !isVendor) {
    throw new ApiError(403, "You are not allowed to access this booking");
  }

  res.status(200).json(new ApiResponse(200, booking, "Booking retrieved"));
});

const getUserBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const result = await bookingService.getUserBookings(
    req.user.id,
    req.user.role,
    page,
    limit,
    status
  );

  res.status(200).json(new ApiResponse(200, result, "Bookings retrieved"));
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { newStatus, reason } = req.body;

  if (!newStatus) {
    throw new ApiError(400, "newStatus is required");
  }

  const booking = await bookingService.getBookingById(req.params.bookingId);

  const isAdmin = req.user.role === "ADMIN";
  const isCustomer = booking.customerId === req.user.id;

  let isVendor = false;
  if (req.user.role === "VENDOR") {
    const vendorProfile = await VendorProfile.findOne({
      where: { userId: req.user.id },
    });
    isVendor = !!vendorProfile && booking.vendorId === vendorProfile.id;
  }

  if (!isAdmin && !isVendor && !isCustomer) {
    throw new ApiError(403, "You are not allowed to update this booking");
  }

  if (!bookingStatusService.isValidTransition(booking.status, newStatus)) {
    throw new ApiError(
      400,
      `Invalid status transition: ${booking.status} → ${newStatus}`
    );
  }

  const updated = await bookingService.updateBookingStatus(
    req.params.bookingId,
    newStatus,
    reason,
    req.user.id
  );

  res
    .status(200)
    .json(new ApiResponse(200, updated, "Booking status updated"));
});

module.exports = {
  createBooking,
  getBooking,
  getUserBookings,
  updateBookingStatus,
};