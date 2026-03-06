/**
 * Dispute Service
 * Handles dispute creation, investigation, and resolution
 */

const Dispute = require('../models/Dispute');
const DisputeMessage = require('../models/DisputeMessage');
const DisputeAttachment = require('../models/DisputeAttachment');
const Booking = require('../models/Booking');
const apiError = require('../utils/apiError');

/**
 * Create dispute
 */
const createDispute = async (bookingId, disputeData) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new apiError(404, 'Booking not found');
  }

  return await Dispute.create({
    bookingId,
    ...disputeData,
  });
};

/**
 * Get dispute
 */
const getDispute = async (disputeId) => {
  const dispute = await Dispute.findByPk(disputeId, {
    include: [
      { model: DisputeMessage, as: 'messages' },
      { model: DisputeAttachment, as: 'attachments' },
    ],
  });
  if (!dispute) {
    throw new apiError(404, 'Dispute not found');
  }
  return dispute;
};

/**
 * Add message to dispute
 */
const addDisputeMessage = async (disputeId, messageData) => {
  return await DisputeMessage.create({
    disputeId,
    ...messageData,
  });
};

/**
 * Add attachment to dispute
 */
const addDisputeAttachment = async (disputeId, attachmentData) => {
  return await DisputeAttachment.create({
    disputeId,
    ...attachmentData,
  });
};

/**
 * Resolve dispute
 */
const resolveDispute = async (disputeId, resolution) => {
  const dispute = await getDispute(disputeId);
  await dispute.update({
    status: 'RESOLVED',
    resolution,
    resolvedAt: new Date(),
  });
  return dispute;
};

module.exports = {
  createDispute,
  getDispute,
  addDisputeMessage,
  addDisputeAttachment,
  resolveDispute,
};
