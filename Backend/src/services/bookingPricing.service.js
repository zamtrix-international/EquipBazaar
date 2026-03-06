const { Equipment, CommissionRule } = require("../models");

const calculateBookingPrice = async (equipmentId, days, vendorId) => {

  const equipment = await Equipment.findByPk(equipmentId);

  if (!equipment) {
    throw new Error("Equipment not found");
  }

  const basePrice = equipment.dailyRate * days;

  const rule = await CommissionRule.findOne({
    where: { vendorId }
  });

  const commissionRate = rule ? rule.commissionRate : 0.1;

  const commission = basePrice * commissionRate;

  const subtotal = basePrice + commission;

  const gst = subtotal * 0.18;

  return {
    basePrice,
    commission,
    gst,
    totalAmount: subtotal + gst
  };
};

module.exports = {
  calculateBookingPrice
};