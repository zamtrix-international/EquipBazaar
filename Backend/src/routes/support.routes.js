/**
 * Support Routes
 */

const express = require("express");
const router = express.Router();

const supportController = require("../controllers/support.controller");
const { auth } = require("../middlewares/auth.middleware");
const {
  createSupportTicketValidation,
  addTicketMessageValidation,
  getUserTicketsValidation,
} = require("../validations/support.validation");

// Create support ticket
router.post(
  "/",
  auth,
  createSupportTicketValidation,
  supportController.createSupportTicket
);

// Get user support tickets
router.get(
  "/",
  auth,
  getUserTicketsValidation,
  supportController.getUserSupportTickets
);

// Get support ticket
router.get(
  "/:ticketId",
  auth,
  supportController.getSupportTicket
);

// Add ticket message
router.post(
  "/:ticketId/message",
  auth,
  addTicketMessageValidation,
  supportController.addTicketMessage
);

// Close support ticket
router.patch(
  "/:ticketId/close",
  auth,
  supportController.closeTicket
);

module.exports = router;