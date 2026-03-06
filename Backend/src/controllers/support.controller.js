/**
 * Support Controller
 * Handles support tickets and customer support
 */

const asyncHandler = require('../utils/asyncHandler');
const supportService = require('../services/support.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Create support ticket
 */
const createSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await supportService.createSupportTicket(req.user.id, req.body);
  res.status(201).json(new apiResponse(201, ticket, 'Support ticket created'));
});

/**
 * Get support ticket
 */
const getSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await supportService.getSupportTicket(req.params.ticketId);
  res.status(200).json(new apiResponse(200, ticket, 'Support ticket retrieved'));
});

/**
 * Get user support tickets
 */
const getUserSupportTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tickets = await supportService.getUserSupportTickets(req.user.id, page, limit);
  res.status(200).json(new apiResponse(200, tickets, 'Support tickets retrieved'));
});

/**
 * Add ticket message
 */
const addTicketMessage = asyncHandler(async (req, res) => {
  const message = await supportService.addTicketMessage(req.params.ticketId, {
    ...req.body,
    userId: req.user.id,
  });

  res.status(201).json(new apiResponse(201, message, 'Message added to ticket'));
});

/**
 * Close support ticket
 */
const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await supportService.closeTicket(
    req.params.ticketId,
    req.body.reason
  );

  res.status(200).json(new apiResponse(200, ticket, 'Support ticket closed'));
});

module.exports = {
  createSupportTicket,
  getSupportTicket,
  getUserSupportTickets,
  addTicketMessage,
  closeTicket,
};
