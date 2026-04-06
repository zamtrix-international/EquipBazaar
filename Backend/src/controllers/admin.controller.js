/**
 * Admin Controller
 * Handles admin dashboard operations
 */

const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const VendorKycDocument = require('../models/VendorKycDocument');
const VendorProfile = require('../models/VendorProfile');
const { Op } = require('sequelize');

/**
 * Get dashboard stats
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.count();
  const totalBookings = await Booking.count();
  const totalRevenue = await Payment.sum('amount', {
    where: { status: 'SUCCESS' },
  });

  const stats = {
    totalUsers,
    totalBookings,
    totalRevenue: totalRevenue || 0,
  };

  res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved'));
});

/**
 * Get pending approvals
 * (existing behavior kept: pending bookings)
 */
const getPendingApprovals = asyncHandler(async (req, res) => {
  const pendingBookings = await Booking.findAll({
    where: { status: 'PENDING' },
    limit: 20,
  });

  res
    .status(200)
    .json(new ApiResponse(200, pendingBookings, 'Pending approvals retrieved'));
});

/**
 * Get pending KYC documents
 */
const getPendingKycDocuments = asyncHandler(async (req, res) => {
  const pendingKycDocuments = await VendorKycDocument.findAll({
    where: { status: 'PENDING' },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  res.status(200).json(
    new ApiResponse(200, pendingKycDocuments, 'Pending KYC documents retrieved')
  );
});

/**
 * Review KYC document (APPROVED / REJECTED)
 */
const reviewKycDocument = asyncHandler(async (req, res) => {
  const { kycId } = req.params;
  const { status, reviewNote } = req.body;

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Valid status is required: APPROVED or REJECTED'));
  }

  const kycDocument = await VendorKycDocument.findByPk(kycId);

  if (!kycDocument) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'KYC document not found'));
  }

  kycDocument.status = status;
  kycDocument.reviewNote = reviewNote || null;
  kycDocument.reviewedByAdminId = req.user.id;

  await kycDocument.save();

  if (status === 'APPROVED') {
    await VendorProfile.update(
      {
        isApproved: true,
        approvedAt: new Date(),
      },
      {
        where: { id: kycDocument.vendorId },
      }
    );
  }

  if (status === 'REJECTED') {
    await VendorProfile.update(
      {
        isApproved: false,
      },
      {
        where: { id: kycDocument.vendorId },
      }
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, kycDocument, 'KYC document reviewed successfully'));
});

/**
 * Get system logs
 */
const getSystemLogs = asyncHandler(async (req, res) => {
  // TODO: Implement log retrieval
  res.status(200).json(new ApiResponse(200, [], 'System logs retrieved'));
});

/**
 * Get all support tickets (admin only)
 */
const getAllSupportTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category } = req.query;

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);
  const offset = (safePage - 1) * safeLimit;

  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const tickets = await require('../models/SupportTicket').findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role']
      }
    ]
  });

  res.status(200).json(new ApiResponse(200, tickets, 'Support tickets retrieved'));
});

/**
 * Get support ticket details (admin only)
 */
const getSupportTicketDetails = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await require('../models/SupportTicket').findByPk(ticketId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role']
      },
      {
        model: require('../models/SupportMessage'),
        as: 'messages',
        required: false,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'role']
          }
        ],
        order: [['createdAt', 'ASC']]
      },
      {
        model: require('../models/SupportAttachment'),
        as: 'attachments',
        required: false
      }
    ]
  });

  if (!ticket) {
    return res.status(404).json(new ApiResponse(404, null, 'Support ticket not found'));
  }

  res.status(200).json(new ApiResponse(200, ticket, 'Support ticket details retrieved'));
});

/**
 * Add message to support ticket (admin only)
 */
const addSupportTicketMessage = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { message } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json(new ApiResponse(400, null, 'Message is required'));
  }

  const SupportMessage = require('../models/SupportMessage');
  const newMessage = await SupportMessage.create({
    ticketId,
    senderUserId: req.user.id,
    message: String(message).trim(),
  });

  // Get the message with sender details
  const messageWithSender = await SupportMessage.findByPk(newMessage.id, {
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'email', 'role']
      }
    ]
  });

  res.status(201).json(new ApiResponse(201, messageWithSender, 'Message added to support ticket'));
});

/**
 * Close support ticket (admin only)
 */
const closeSupportTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { reason } = req.body;

  const SupportTicket = require('../models/SupportTicket');
  const ticket = await SupportTicket.findByPk(ticketId);

  if (!ticket) {
    return res.status(404).json(new ApiResponse(404, null, 'Support ticket not found'));
  }

  if (ticket.status === 'CLOSED') {
    return res.status(400).json(new ApiResponse(400, null, 'Ticket is already closed'));
  }

  ticket.status = 'CLOSED';
  ticket.closedAt = new Date();
  await ticket.save();

  // Add closing message if reason provided
  if (reason && String(reason).trim()) {
    const SupportMessage = require('../models/SupportMessage');
    await SupportMessage.create({
      ticketId: ticket.id,
      senderUserId: req.user.id,
      message: `Ticket closed by admin: ${String(reason).trim()}`,
    });
  }

  res.status(200).json(new ApiResponse(200, ticket, 'Support ticket closed successfully'));
});

module.exports = {
  getDashboardStats,
  getPendingApprovals,
  getPendingKycDocuments,
  reviewKycDocument,
  getSystemLogs,
  getAllSupportTickets,
  getSupportTicketDetails,
  addSupportTicketMessage,
  closeSupportTicket,
};