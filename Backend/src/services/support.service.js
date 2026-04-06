/**
 * Support Service
 * Manages support tickets and customer support operations
 */

const SupportTicket = require('../models/SupportTicket');
const SupportMessage = require('../models/SupportMessage');
const SupportAttachment = require('../models/SupportAttachment');
const { ApiError } = require('../utils/apiError');

const normalizeRole = (role) => {
  if (role === 'CUSTOMER' || role === 'VENDOR') {
    return role;
  }

  throw new ApiError(400, 'Only CUSTOMER or VENDOR can create support tickets');
};

/**
 * Create support ticket
 */
const createSupportTicket = async (user, ticketData) => {
  const role = normalizeRole(user.role);

  const subject = ticketData.subject ? String(ticketData.subject).trim() : '';
  const description = ticketData.description
    ? String(ticketData.description).trim()
    : null;

  if (!subject) {
    throw new ApiError(400, 'subject is required');
  }

  const ticket = await SupportTicket.create({
    createdByUserId: user.id,
    role,
    category: ticketData.category || 'OTHER',
    priority: ticketData.priority || 'LOW',
    subject,
    description,
    status: 'OPEN',
  });

  if (description) {
    await SupportMessage.create({
      ticketId: ticket.id,
      senderUserId: user.id,
      message: description,
    });
  }

  return await getSupportTicket(ticket.id);
};

/**
 * Get support ticket
 */
const getSupportTicket = async (ticketId) => {
  const ticket = await SupportTicket.findByPk(ticketId, {
    include: [
      { model: SupportMessage, as: 'messages', required: false },
      { model: SupportAttachment, as: 'attachments', required: false },
    ],
  });

  if (!ticket) {
    throw new ApiError(404, 'Support ticket not found');
  }

  return ticket;
};

/**
 * Get user support tickets
 */
const getUserSupportTickets = async (user, page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);
  const offset = (safePage - 1) * safeLimit;

  const where =
    user.role === 'ADMIN'
      ? {}
      : { createdByUserId: user.id };

  return await SupportTicket.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Add message to ticket
 */
const addTicketMessage = async (ticketId, messageData) => {
  const ticket = await getSupportTicket(ticketId);

  if (ticket.status === 'CLOSED') {
    throw new ApiError(400, 'Cannot add message to a closed ticket');
  }

  const message = messageData.message ? String(messageData.message).trim() : '';

  if (!message) {
    throw new ApiError(400, 'message is required');
  }

  return await SupportMessage.create({
    ticketId,
    senderUserId: messageData.senderUserId,
    message,
  });
};

/**
 * Add attachment to ticket
 */
const addTicketAttachment = async (ticketId, attachmentData) => {
  await getSupportTicket(ticketId);

  return await SupportAttachment.create({
    ticketId,
    ...attachmentData,
  });
};

/**
 * Close ticket
 */
const closeTicket = async (ticketId, reason = null, closedByUserId = null) => {
  const ticket = await getSupportTicket(ticketId);

  if (ticket.status === 'CLOSED') {
    return ticket;
  }

  ticket.status = 'CLOSED';
  ticket.closedAt = new Date();

  await ticket.save();

  if (reason && String(reason).trim()) {
    await SupportMessage.create({
      ticketId: ticket.id,
      senderUserId: closedByUserId || ticket.createdByUserId,
      message: `Ticket closed: ${String(reason).trim()}`,
    });
  }

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