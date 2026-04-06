/**
 * Dispute Controller
 * Handles dispute creation and management
 */

const asyncHandler = require('../utils/asyncHandler');
const disputeService = require('../services/dispute.service');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Create dispute
 */
const createDispute = asyncHandler(async (req, res) => {
  const dispute = await disputeService.createDispute(req.params.bookingId, {
    ...req.body,
    raisedByUserId: req.user.id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, dispute, 'Dispute created'));
});

/**
 * Get dispute
 */
const getDispute = asyncHandler(async (req, res) => {
  const dispute = await disputeService.getDispute(req.params.disputeId);

  res
    .status(200)
    .json(new ApiResponse(200, dispute, 'Dispute retrieved'));
});

/**
 * Add dispute message
 */
const addDisputeMessage = asyncHandler(async (req, res) => {
  const message = await disputeService.addDisputeMessage(req.params.disputeId, {
    ...req.body,
    userId: req.user.id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, message, 'Message added to dispute'));
});

/**
 * Resolve dispute
 */
const resolveDispute = asyncHandler(async (req, res) => {
  const dispute = await disputeService.resolveDispute(
    req.params.disputeId,
    {
      resolutionNote: req.body.resolutionNote || req.body.resolution || null,
      resolvedByAdminId: req.user.id,
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, dispute, 'Dispute resolved'));
});

module.exports = {
  createDispute,
  getDispute,
  addDisputeMessage,
  resolveDispute,
};