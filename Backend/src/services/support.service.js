/**
 * Support Service
 * Manages support tickets and customer support operations
 */

const SupportTicket = require('../models/SupportTicket');
const SupportMessage = require('../models/SupportMessage');
const SupportAttachment = require('../models/SupportAttachment');
const apiError = require('../utils/apiError');

/**
 * Create support ticket
 */
const createSupportTicket = async (userId, ticketData) => {
  return await SupportTicket.create({
    userId,
    ...ticketData,
    status: 'OPEN',
  });
};

/**
 * Get support ticket
 */
const getSupportTicket = async (ticketId) => {
  const ticket = await SupportTicket.findByPk(ticketId, {
    include: [
      { model: SupportMessage, as: 'messages' },
      { model: SupportAttachment, as: 'attachments' },
    ],
  });
  if (!ticket) {
    throw new apiError(404, 'Support ticket not found');
  }
  return ticket;
};

/**
 * Get user support tickets
 */
const getUserSupportTickets = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await SupportTicket.findAndCountAll({
    where: { userId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Add message to ticket
 */
const addTicketMessage = async (ticketId, messageData) => {
  const ticket = await getSupportTicket(ticketId);
  return await SupportMessage.create({
    ticketId,
    ...messageData,
  });
};

/**
 * Add attachment to ticket
 */
const addTicketAttachment = async (ticketId, attachmentData) => {
  return await SupportAttachment.create({
    ticketId,
    ...attachmentData,
  });
};

/**
 * Close ticket
 */
const closeTicket = async (ticketId, reason) => {
  const ticket = await getSupportTicket(ticketId);
  ticket.status = 'CLOSED';
  ticket.closedAt = new Date();
  await ticket.save();
  return ticket;
};

module.exports = {
  createSupportTicket,
  getSupportTicket,
  getUserSupportTickets,
  addTicketMessage,
  addTicketAttachment,
  closeTicket,
};
