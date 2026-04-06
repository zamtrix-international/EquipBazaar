/**
 * Admin Routes
 */

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

// ===================== Dashboard =====================

// Get dashboard stats
router.get(
  "/dashboard",
  auth,
  rbac("ADMIN"),
  adminController.getDashboardStats
);

// ===================== Existing Approvals =====================

// Get pending approvals (bookings)
router.get(
  "/approvals",
  auth,
  rbac("ADMIN"),
  adminController.getPendingApprovals
);

// ===================== NEW: KYC MODULE =====================

// Get pending KYC documents
router.get(
  "/kyc/pending",
  auth,
  rbac("ADMIN"),
  adminController.getPendingKycDocuments
);

// Approve / Reject KYC
router.patch(
  "/kyc/:kycId/review",
  auth,
  rbac("ADMIN"),
  adminController.reviewKycDocument
);

// ===================== Logs =====================

// Get system logs
router.get(
  "/logs",
  auth,
  rbac("ADMIN"),
  adminController.getSystemLogs
);

// ===================== Support Tickets =====================

// Get all support tickets (admin only)
router.get(
  "/support",
  auth,
  rbac("ADMIN"),
  adminController.getAllSupportTickets
);

// Get support ticket details (admin only)
router.get(
  "/support/:ticketId",
  auth,
  rbac("ADMIN"),
  adminController.getSupportTicketDetails
);

// Add message to support ticket (admin only)
router.post(
  "/support/:ticketId/message",
  auth,
  rbac("ADMIN"),
  adminController.addSupportTicketMessage
);

// Close support ticket (admin only)
router.patch(
  "/support/:ticketId/close",
  auth,
  rbac("ADMIN"),
  adminController.closeSupportTicket
);

module.exports = router;