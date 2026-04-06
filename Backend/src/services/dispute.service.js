/**
 * Dispute Service
 * Handles dispute creation and management
 */

const Dispute = require('../models/Dispute');
const DisputeMessage = require('../models/DisputeMessage');
const Booking = require('../models/Booking');
const { ApiError } = require('../utils/apiError');

/**
 * Normalize dispute payload
 */
const normalizeDisputeData = (data = {}) => {
  return {
    raisedByUserId: data.raisedByUserId,
    reasonCategory: data.reasonCategory || data.category || 'OTHER',
    description: data.description,
  };
};

/**
 * Create dispute
 */
const createDispute = async (bookingId, disputeData) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const existingDispute = await Dispute.findOne({
    where: { bookingId },
  });

  if (existingDispute) {
    throw new ApiError(400, 'Dispute already exists for this booking');
  }

  const normalizedData = normalizeDisputeData(disputeData);

  return await Dispute.create({
    bookingId,
    ...normalizedData,
  });
};

/**
 * Get dispute
 */
const getDispute = async (disputeId) => {
  const dispute = await Dispute.findByPk(disputeId);

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  return dispute;
};

/**
 * Add dispute message
 */
const addDisputeMessage = async (disputeId, messageData) => {
  await getDispute(disputeId);

  return await DisputeMessage.create({
    disputeId,
    senderUserId: messageData.userId,
    message: messageData.message,
  });
};

/**
 * Resolve dispute
 */
const resolveDispute = async (disputeId, resolutionData) => {
  const dispute = await getDispute(disputeId);

  dispute.status = 'RESOLVED';
  dispute.resolutionNote = resolutionData.resolutionNote || null;
  dispute.resolvedByAdminId = resolutionData.resolvedByAdminId || null;
  dispute.resolvedAt = new Date();

  await dispute.save();

  return dispute;
};

module.exports = {
  createDispute,
  getDispute,
  addDisputeMessage,
  resolveDispute,
};