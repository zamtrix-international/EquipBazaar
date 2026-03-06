/**
 * Payment Webhook Routes
 */

const express = require('express');
const router = express.Router();
const paymentWebhookController = require('../controllers/paymentWebhook.controller');

// Razorpay webhook
router.post('/razorpay', paymentWebhookController.handleRazorpayWebhook);

// Cashfree webhook
router.post('/cashfree', paymentWebhookController.handleCashfreeWebhook);

module.exports = router;
