/**
 * Cashfree Payment Gateway
 * Integration with Cashfree payment processor
 */

const axios = require('axios');
const crypto = require('crypto');

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';

/**
 * Create order in Cashfree
 */
const createOrder = async (bookingData) => {
  try {
    const response = await axios.post(
      `${CASHFREE_API_URL}/orders`,
      {
        order_id: `booking_${bookingData.bookingId}`,
        order_amount: bookingData.totalAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: bookingData.customerId,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
        },
        order_meta: {
          notify_url: `${process.env.APP_URL}/api/webhooks/cashfree`,
          return_url: `${process.env.APP_URL}/payment/success`,
        },
      },
      {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Cashfree order creation failed: ${error.message}`);
  }
};

/**
 * Verify payment signature
 */
const verifySignature = (orderId, paymentId, signature) => {
  const data = `${orderId}${paymentId}${CASHFREE_CLIENT_SECRET}`;
  const generatedSignature = crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Fetch payment details
 */
const getPaymentDetails = async (orderId) => {
  try {
    const response = await axios.get(
      `${CASHFREE_API_URL}/orders/${orderId}`,
      {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Cashfree payment fetch failed: ${error.message}`);
  }
};

/**
 * Refund payment
 */
const refundPayment = async (orderId, refundAmount) => {
  try {
    const response = await axios.post(
      `${CASHFREE_API_URL}/orders/${orderId}/refunds`,
      {
        refund_amount: refundAmount,
      },
      {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Cashfree refund failed: ${error.message}`);
  }
};

module.exports = {
  createOrder,
  verifySignature,
  getPaymentDetails,
  refundPayment,
};
