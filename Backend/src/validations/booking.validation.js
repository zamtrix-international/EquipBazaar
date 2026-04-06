/**
 * Booking Validation Schema
 */

const { body, query, param } = require("express-validator");

const bookingStatuses = [
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "PAID",
  "ON_THE_WAY",
  "WORK_STARTED",
  "DELIVERED",
  "COMPLETED",
  "DISPUTED",
  "CANCELLED",
];

const createBookingValidation = [
  body("equipmentId")
    .notEmpty()
    .withMessage("equipmentId is required")
    .isInt({ min: 1 }),

  body("vendorId")
    .optional()
    .isInt({ min: 1 }),

  body("serviceDate")
    .optional()
    .isISO8601(),

  body("startDate")
    .optional()
    .isISO8601(),

  body("endDate")
    .optional()
    .isISO8601(),

  body("days")
    .optional()
    .isInt({ min: 1 }),

  body("startTime")
    .optional()
    .isString()
    .trim(),

  body("estimatedHours")
    .optional()
    .isFloat({ min: 0 }),

  body("estimatedKm")
    .optional()
    .isFloat({ min: 0 }),

  body("locationText")
    .notEmpty()
    .withMessage("locationText is required")
    .isString()
    .trim(),

  body("city")
    .optional()
    .isString()
    .trim(),

  body("notes")
    .optional()
    .isString()
    .trim(),

  body("kmRate")
    .optional()
    .isFloat({ min: 0 }),

  body().custom((value) => {
    if (!value.serviceDate && !value.startDate) {
      throw new Error("Either serviceDate or startDate is required");
    }
    return true;
  }),
];

const updateBookingStatusValidation = [
  body("newStatus")
    .notEmpty()
    .withMessage("newStatus is required")
    .isIn(bookingStatuses),

  body("reason")
    .optional()
    .isString()
    .trim(),
];

const getBookingsValidation = [
  param("bookingId")
    .optional()
    .isInt({ min: 1 }),

  query("page")
    .optional()
    .isInt({ min: 1 }),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }),
];

module.exports = {
  createBookingValidation,
  updateBookingStatusValidation,
  getBookingsValidation,
};