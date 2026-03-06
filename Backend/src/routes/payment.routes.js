/**
 * Payment Routes
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');

// Initiate payment
router.post('/:bookingId/initiate', auth, paymentController.initiatePayment);

// Verify payment
router.post('/:paymentId/verify', auth, paymentController.verifyPayment);

// Get payment details
router.get('/:paymentId', auth, paymentController.getPaymentDetails);

module.exports = router;
