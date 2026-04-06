// Test script to verify vendor pickup and customer approve return flow
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Mock tokens (you would need real tokens from login)
const VENDOR_TOKEN = 'your_vendor_jwt_token_here';
const CUSTOMER_TOKEN = 'your_customer_jwt_token_here';

// Test booking ID (replace with actual booking ID)
const TEST_BOOKING_ID = 40;

async function testVendorPickupConfirm() {
  console.log('🧪 Testing Vendor Pickup Confirmation...');

  try {
    const response = await axios.post(
      `${API_BASE}/delivery/${TEST_BOOKING_ID}/confirm-pickup`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${VENDOR_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Vendor pickup confirmed:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Vendor pickup failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCustomerApproveReturn() {
  console.log('🧪 Testing Customer Return Approval...');

  try {
    const response = await axios.post(
      `${API_BASE}/delivery/${TEST_BOOKING_ID}/confirm-return`,
      { customerApproved: true },
      {
        headers: {
          'Authorization': `Bearer ${CUSTOMER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Customer return approved:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Customer approval failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Flow Test...\n');

  // Step 1: Vendor confirms pickup
  const pickupSuccess = await testVendorPickupConfirm();
  console.log('');

  if (pickupSuccess) {
    // Step 2: Customer approves return
    await testCustomerApproveReturn();
  }

  console.log('\n✨ Test completed!');
}

// Uncomment to run the test (requires real tokens and booking ID)
// runTests();

module.exports = { testVendorPickupConfirm, testCustomerApproveReturn };