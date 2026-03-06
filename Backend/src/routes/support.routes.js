/**
 * Support Routes
 */

const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Create support ticket
router.post('/', auth, supportController.createSupportTicket);

// Get support ticket
router.get('/:ticketId', auth, supportController.getSupportTicket);

// Get user support tickets
router.get('/', auth, supportController.getUserSupportTickets);

// Add ticket message
router.post('/:ticketId/message', auth, supportController.addTicketMessage);

// Close support ticket
router.patch('/:ticketId/close', auth, supportController.closeTicket);

module.exports = router;
