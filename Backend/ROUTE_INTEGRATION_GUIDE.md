# ROUTE INTEGRATION GUIDE

## How to Integrate All New Routes into Your App

### Step 1: Update `routes/index.js`

Replace the current `routes/index.js` with this code:

```javascript
/**
 * Main Routes Aggregator
 * Combines all route modules for the Express app
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const vendorRoutes = require('./vendor.routes');
const equipmentRoutes = require('./equipment.routes');
const bookingRoutes = require('./booking.routes');
const deliveryRoutes = require('./delivery.routes');
const disputeRoutes = require('./dispute.routes');
const paymentRoutes = require('./payment.routes');
const paymentWebhookRoutes = require('./paymentWebhook.routes');
const walletRoutes = require('./wallet.routes');
const payoutRoutes = require('./payout.routes');
const commissionRoutes = require('./commission.routes');
const reviewRoutes = require('./review.routes');
const supportRoutes = require('./support.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');
const settingsRoutes = require('./settings.routes');

const router = express.Router();

/**
 * Mount all routes with their prefixes
 */

// Authentication routes
router.use('/auth', authRoutes);

// User management
router.use('/users', userRoutes);

// Vendor management
router.use('/vendors', vendorRoutes);

// Equipment management
router.use('/equipment', equipmentRoutes);

// Booking management
router.use('/bookings', bookingRoutes);

// Delivery management
router.use('/deliveries', deliveryRoutes);

// Dispute management
router.use('/disputes', disputeRoutes);

// Payment processing
router.use('/payments', paymentRoutes);

// Payment webhooks
router.use('/webhooks/payments', paymentWebhookRoutes);

// Wallet management
router.use('/wallet', walletRoutes);

// Payout management
router.use('/payouts', payoutRoutes);

// Commission management
router.use('/commission', commissionRoutes);

// Reviews
router.use('/reviews', reviewRoutes);

// Support
router.use('/support', supportRoutes);

// Reports
router.use('/reports', reportRoutes);

// Admin
router.use('/admin', adminRoutes);

// Settings
router.use('/settings', settingsRoutes);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

/**
 * 404 handler for undefined routes
 */
router.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: 'Route not found',
  });
});

module.exports = router;
```

---

### Step 2: Update `app.js` to Mount Routes

Ensure your `app.js` includes:

```javascript
const routes = require('./routes');

// ... other middleware setup ...

// Mount all routes with /api prefix
app.use('/api', routes);

// ... error handling middleware ...
```

---

### Step 3: Complete Endpoint Reference

All routes are now accessible at:

```
GET    /api/health                               ← Health check
POST   /api/auth/register                        ← User registration
POST   /api/auth/login                           ← User login

GET    /api/users/profile                        ← Get profile
PUT    /api/users/profile                        ← Update profile
GET    /api/users                                ← List all users (ADMIN)

POST   /api/vendors                              ← Create vendor profile
GET    /api/vendors/:vendorId                    ← Get vendor details
PUT    /api/vendors/:vendorId                    ← Update vendor
POST   /api/vendors/:vendorId/kyc                ← Upload KYC
POST   /api/vendors/:vendorId/bank-account       ← Add bank account

POST   /api/equipment                            ← Create equipment
GET    /api/equipment/:equipmentId               ← Get equipment
GET    /api/equipment                            ← List equipment
PUT    /api/equipment/:equipmentId               ← Update equipment
POST   /api/equipment/:equipmentId/images        ← Add image

POST   /api/bookings                             ← Create booking
GET    /api/bookings/:bookingId                  ← Get booking
GET    /api/bookings                             ← My bookings
PATCH  /api/bookings/:bookingId/status           ← Update status

POST   /api/deliveries/:bookingId/confirm-pickup  ← Confirm pickup
POST   /api/deliveries/:bookingId/confirm-return  ← Confirm return
GET    /api/deliveries/:bookingId/status          ← Get delivery status

POST   /api/disputes/:bookingId                  ← Create dispute
GET    /api/disputes/:disputeId                  ← Get dispute
POST   /api/disputes/:disputeId/message          ← Add message
PATCH  /api/disputes/:disputeId/resolve          ← Resolve (ADMIN)

POST   /api/payments/:bookingId/initiate         ← Initiate payment
POST   /api/payments/:paymentId/verify           ← Verify payment
GET    /api/payments/:paymentId                  ← Get payment details

POST   /api/webhooks/payments/razorpay           ← Razorpay webhook
POST   /api/webhooks/payments/cashfree           ← Cashfree webhook

GET    /api/wallet/balance                       ← Get balance (VENDOR)
GET    /api/wallet/ledger                        ← Get ledger (VENDOR)
POST   /api/wallet/add-funds                     ← Add funds (VENDOR)

POST   /api/payouts/withdrawal-request           ← Withdraw (VENDOR)
GET    /api/payouts                              ← Get payouts (VENDOR)
PATCH  /api/payouts/withdrawal-request/:id/process  ← Process (ADMIN)

GET    /api/commission/:vendorId                 ← Get rule
PUT    /api/commission/:vendorId                 ← Update rule (ADMIN)

POST   /api/reviews/:bookingId                   ← Create review
GET    /api/reviews/equipment/:equipmentId       ← Equipment reviews
GET    /api/reviews/vendor/:vendorId             ← Vendor reviews

POST   /api/support/ticket                       ← Create ticket
GET    /api/support/ticket/:ticketId             ← Get ticket
GET    /api/support/tickets                      ← My tickets
POST   /api/support/ticket/:ticketId/message     ← Add message
PATCH  /api/support/ticket/:ticketId/close       ← Close ticket

GET    /api/reports/booking                      ← Booking report (VENDOR)
POST   /api/reports/export                       ← Export report (VENDOR)
GET    /api/reports                              ← My reports (VENDOR)

GET    /api/admin/dashboard                      ← Dashboard (ADMIN)
GET    /api/admin/approvals                      ← Pending approvals (ADMIN)
GET    /api/admin/logs                           ← System logs (ADMIN)

GET    /api/settings/payment-gateway             ← Gateway config (ADMIN)
PUT    /api/settings/payment-gateway             ← Update config (ADMIN)
GET    /api/settings/app                         ← App settings (ADMIN)
PUT    /api/settings/app                         ← Update settings (ADMIN)
```

---

### Step 4: Testing the Routes

Use Postman/Thunder Client with these requests:

```bash
# Health check
curl http://localhost:5000/api/health

# Create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": 1,
    "vendorId": 2,
    "startDate": "2026-03-10",
    "endDate": "2026-03-15",
    "days": 5
  }'

# Get user profile
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Step 5: Authentication Header Format

All protected endpoints require:

```
Authorization: Bearer {JWT_TOKEN}
```

Example in JavaScript:
```javascript
const response = await fetch('/api/bookings', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(bookingData)
});
```

---

### Step 6: Response Format

All endpoints return standardized responses:

**Success (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "Some Data"
  },
  "message": "Operation successful",
  "success": true
}
```

**Error (400/500):**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

### Step 7: Common Issues & Solutions

**Issue**: 404 - Route not found
```
Solution: Check if routes are properly imported in routes/index.js
          Verify route prefix is correct in main routes file
```

**Issue**: 401 - Unauthorized
```
Solution: Check if Authorization header is present
          Verify JWT token is valid and not expired
          Ensure user has required role for the endpoint
```

**Issue**: 422 - Validation error
```
Solution: Check request body matches validation schema
          Verify required fields are provided
          Check data types match expected format
```

**Issue**: Payment webhook not working
```
Solution: Check webhook URL in payment gateway dashboard
          Verify IP address whitelisting or SSL
          Check request signature verification logic
```

---

### Step 8: Environment Setup Checklist

Add these to `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=equipment_rental

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=refresh_secret
REFRESH_TOKEN_EXPIRE=30d

# Payment Gateways
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_API_URL=https://api.cashfree.com/pg

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@equipmentrental.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs
```

---

## 🎯 Quick Integration Checklist

- [ ] Import all routes in `routes/index.js`
- [ ] Mount routes in `app.js` with `/api` prefix
- [ ] Add environment variables to `.env`
- [ ] Test health endpoint: `GET /api/health`
- [ ] Test auth endpoints: `POST /api/auth/login`
- [ ] Test protected endpoints with valid JWT
- [ ] Verify role-based access control
- [ ] Test payment webhook endpoints
- [ ] Setup payment gateway webhooks
- [ ] Run database migrations
- [ ] Setup email configuration
- [ ] Enable file upload middleware
- [ ] Configure CORS if needed for frontend

---

**Ready to go! Your backend is now fully structured and ready for testing.** 🚀
