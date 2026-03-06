/**
 * Dispute Routes
 */

const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/dispute.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Create dispute
router.post('/:bookingId/dispute', auth, disputeController.createDispute);

// Get dispute
router.get('/:disputeId', auth, disputeController.getDispute);

// Add dispute message
router.post('/:disputeId/message', auth, disputeController.addDisputeMessage);

// Resolve dispute (admin only)
router.patch('/:disputeId/resolve', auth, disputeController.resolveDispute);

module.exports = router;
