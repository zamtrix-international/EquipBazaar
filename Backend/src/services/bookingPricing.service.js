/**
 * Booking Pricing Service
 */

const Equipment = require("../models/Equipment");
const CommissionRule = require("../models/CommissionRule");
const { ApiError } = require("../utils/apiError");

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num;
};

const calculateBookingPrice = async (equipmentId, estimatedHours, vendorId = null) => {
  const equipment = await Equipment.findByPk(equipmentId);

  if (!equipment) {
    throw new ApiError(404, "Equipment not found");
  }

  // TEMPORARY RULE:
  // booking allowed if equipment is active
  // isApproved check removed for now
  if (!equipment.isActive) {
    throw new ApiError(400, "Equipment is not available for booking");
  }

  const resolvedVendorId = vendorId || equipment.vendorId;

  const hoursInput = normalizeNumber(estimatedHours, 0);
  const minimumHours = normalizeNumber(equipment.minimumHours, 1);
  const hours = Math.max(hoursInput, minimumHours);

  const hourlyRate = normalizeNumber(equipment.hourlyRate);
  const kmRate = normalizeNumber(equipment.kmRate);
  const basePrice = Number((hourlyRate * hours).toFixed(2));

  let commissionPct = 10;

  const globalCommissionRule = await CommissionRule.findOne({
    where: { scope: "GLOBAL" },
  });

  if (globalCommissionRule) {
    commissionPct = normalizeNumber(globalCommissionRule.commissionPct, 10);
  }

  const commissionAmount = Number(
    ((basePrice * commissionPct) / 100).toFixed(2)
  );

  const vendorNetAmount = Number(
    (basePrice - commissionAmount).toFixed(2)
  );

  return {
    vendorId: resolvedVendorId,
    hourlyRate,
    kmRate,
    estimatedHours: hours,
    basePrice,
    commissionPct,
    commissionAmount,
    vendorNetAmount,
    totalAmount: basePrice,
  };
};

const calculateKmCharges = (equipment, estimatedKm) => {
  const kmRate = normalizeNumber(equipment?.kmRate);
  const km = normalizeNumber(estimatedKm);

  if (!kmRate || !km) return 0;

  return Number((kmRate * km).toFixed(2));
};

const calculateTax = (amount) => {
  const value = normalizeNumber(amount);
  return Number((value * 0.18).toFixed(2));
};

module.exports = {
  calculateBookingPrice,
  calculateKmCharges,
  calculateTax,
};