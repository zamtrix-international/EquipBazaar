/**
 * Razorpay Payment Gateway
 * Integration with Razorpay payment processor
 */

const axios = require('axios');
const crypto = require('crypto');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

/**
 * Create order in Razorpay
 */
const createOrder = async (bookingData) => {
  try {
    const response = await axios.post(
      `${RAZORPAY_API_URL}/orders`,
      {
        amount: bookingData.totalAmount * 100, // Razorpay uses smallest currency unit
        currency: 'INR',
        receipt: `booking_${bookingData.bookingId}`,
        notes: {
          bookingId: bookingData.bookingId,
          customerId: bookingData.customerId,
        },
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

/**
 * Verify payment signature
 */
const verifySignature = (orderId, paymentId, signature) => {
  const data = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(data)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Fetch payment details
 */
const getPaymentDetails = async (paymentId) => {
  try {
    const response = await axios.get(
      `${RAZORPAY_API_URL}/payments/${paymentId}`,
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Razorpay payment fetch failed: ${error.message}`);
  }
};

/**
 * Refund payment
 */
const refundPayment = async (paymentId, amount) => {
  try {
    const response = await axios.post(
      `${RAZORPAY_API_URL}/payments/${paymentId}/refund`,
      amount ? { amount: amount * 100 } : {},
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Razorpay refund failed: ${error.message}`);
  }
};

module.exports = {
  createOrder,
  verifySignature,
  getPaymentDetails,
  refundPayment,
};
