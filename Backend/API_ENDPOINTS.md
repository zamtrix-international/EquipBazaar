# Complete API Endpoints Documentation

## BASE URL
```
http://localhost:5000/api
```

---

## 1. AUTHENTICATION ENDPOINTS (10 endpoints)
Already existing in `auth.routes.js`

### Auth Routes (Existing)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| POST | `/auth/refresh-token` | Refresh access token | ✅ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |
| GET | `/auth/verify-email` | Verify email | ❌ |
| POST | `/auth/resend-verification` | Resend verification email | ❌ |
| GET | `/auth/profile` | Get authenticated user | ✅ |
| PUT | `/auth/change-password` | Change password | ✅ |

---

## 2. USER ENDPOINTS (5 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/users/profile` | Get user profile | ✅ | ALL |
| PUT | `/users/profile` | Update user profile | ✅ | ALL |
| GET | `/users` | Get all users (paginated) | ✅ | ADMIN |
| GET | `/users/:userId` | Get user details | ✅ | ADMIN |
| DELETE | `/users/:userId` | Delete user | ✅ | ADMIN |

---

## 3. VENDOR ENDPOINTS (10 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/vendors` | Create vendor profile | ✅ | VENDOR |
| GET | `/vendors/:vendorId` | Get vendor profile | ❌ | ALL |
| PUT | `/vendors/:vendorId` | Update vendor profile | ✅ | VENDOR |
| GET | `/vendors/:vendorId/details` | Get vendor full details with ratings | ❌ | ALL |
| POST | `/vendors/:vendorId/kyc` | Upload KYC document | ✅ | VENDOR |
| GET | `/vendors/:vendorId/kyc` | Get KYC documents | ✅ | VENDOR |
| POST | `/vendors/:vendorId/bank-account` | Add bank account | ✅ | VENDOR |
| GET | `/vendors/:vendorId/bank-account` | Get bank accounts | ✅ | VENDOR |
| DELETE | `/vendors/:vendorId/bank-account/:accountId` | Delete bank account | ✅ | VENDOR |
| GET | `/vendors/search` | Search vendors | ❌ | ALL |

---

## 4. EQUIPMENT ENDPOINTS (12 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/equipment` | Create equipment | ✅ | VENDOR |
| GET | `/equipment/:equipmentId` | Get equipment details | ❌ | ALL |
| GET | `/equipment` | Get all equipment (paginated) | ❌ | ALL |
| GET | `/equipment/vendor/my-equipment` | Get my equipment | ✅ | VENDOR |
| PUT | `/equipment/:equipmentId` | Update equipment | ✅ | VENDOR |
| DELETE | `/equipment/:equipmentId` | Delete equipment | ✅ | VENDOR |
| POST | `/equipment/:equipmentId/images` | Add equipment image | ✅ | VENDOR |
| GET | `/equipment/:equipmentId/images` | Get equipment images | ❌ | ALL |
| DELETE | `/equipment/:equipmentId/images/:imageId` | Delete image | ✅ | VENDOR |
| POST | `/equipment/:equipmentId/availability` | Set availability | ✅ | VENDOR |
| GET | `/equipment/:equipmentId/availability` | Get availability | ❌ | ALL |
| GET | `/equipment/search` | Search equipment | ❌ | ALL |

---

## 5. BOOKING ENDPOINTS (12 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/bookings` | Create booking | ✅ | CUSTOMER |
| GET | `/bookings/:bookingId` | Get booking details | ✅ | ALL |
| GET | `/bookings` | Get user bookings (paginated) | ✅ | CUSTOMER/VENDOR |
| PATCH | `/bookings/:bookingId/status` | Update booking status | ✅ | CUSTOMER/VENDOR |
| POST | `/bookings/:bookingId/cancel` | Cancel booking | ✅ | CUSTOMER/VENDOR |
| GET | `/bookings/:bookingId/timeline` | Get booking status timeline | ✅ | ALL |
| POST | `/bookings/:bookingId/accept` | Accept booking (vendor) | ✅ | VENDOR |
| POST | `/bookings/:bookingId/reject` | Reject booking (vendor) | ✅ | VENDOR |
| POST | `/bookings/:bookingId/confirm-pickup` | Confirm pickup | ✅ | VENDOR |
| POST | `/bookings/:bookingId/confirm-delivery` | Confirm delivery/return | ✅ | CUSTOMER |
| GET | `/bookings/available` | Get available equipment for dates | ✅ | CUSTOMER |
| GET | `/bookings/analytics` | Get booking analytics (vendor) | ✅ | VENDOR |

---

## 6. DELIVERY ENDPOINTS (5 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/deliveries/:bookingId/confirm-pickup` | Vendor confirms pickup | ✅ | VENDOR |
| POST | `/deliveries/:bookingId/confirm-return` | Confirm equipment return | ✅ | CUSTOMER |
| GET | `/deliveries/:bookingId/status` | Get delivery status | ✅ | ALL |
| GET | `/deliveries/:bookingId/tracking` | Get delivery tracking details | ✅ | ALL |
| PUT | `/deliveries/:bookingId/notes` | Add delivery notes | ✅ | VENDOR |

---

## 7. DISPUTE ENDPOINTS (8 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/disputes/:bookingId` | Create dispute | ✅ | CUSTOMER/VENDOR |
| GET | `/disputes/:disputeId` | Get dispute details | ✅ | ALL |
| GET | `/disputes` | Get user disputes | ✅ | CUSTOMER/VENDOR |
| POST | `/disputes/:disputeId/message` | Add dispute message | ✅ | ALL |
| GET | `/disputes/:disputeId/messages` | Get dispute messages | ✅ | ALL |
| POST | `/disputes/:disputeId/attachment` | Add attachment | ✅ | ALL |
| PATCH | `/disputes/:disputeId/resolve` | Resolve dispute (admin) | ✅ | ADMIN |
| GET | `/disputes/analytics` | Get dispute analytics (admin) | ✅ | ADMIN |

---

## 8. PAYMENT ENDPOINTS (12 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/payments/:bookingId/initiate` | Initiate payment | ✅ | CUSTOMER |
| POST | `/payments/:paymentId/verify` | Verify payment | ✅ | CUSTOMER |
| GET | `/payments/:paymentId` | Get payment details | ✅ | CUSTOMER |
| GET | `/payments` | Get user payments | ✅ | CUSTOMER/VENDOR |
| POST | `/payments/:paymentId/refund` | Request refund | ✅ | ADMIN |
| GET | `/payments/history` | Get payment history | ✅ | CUSTOMER |
| POST | `/payments/webhook/razorpay` | Razorpay webhook | ❌ | - |
| POST | `/payments/webhook/cashfree` | Cashfree webhook | ❌ | - |
| GET | `/payments/reconcile` | Manual payment reconciliation | ✅ | ADMIN |
| GET | `/payments/pending` | Get pending payments | ✅ | ADMIN |
| POST | `/payments/:paymentId/retry` | Retry failed payment | ✅ | CUSTOMER |
| GET | `/payments/analytics` | Payment analytics (admin) | ✅ | ADMIN |

---

## 9. WALLET ENDPOINTS (8 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/wallet/balance` | Get walletbalance | ✅ | VENDOR |
| GET | `/wallet/ledger` | Get wallet transaction ledger | ✅ | VENDOR |
| POST | `/wallet/add-funds` | Add funds to wallet | ✅ | VENDOR |
| GET | `/wallet/summary` | Get wallet summary | ✅ | VENDOR |
| POST | `/wallet/transfer` | Transfer between wallets (admin) | ✅ | ADMIN |
| GET | `/wallet/statement` | Download wallet statement | ✅ | VENDOR |
| GET | `/wallet/earnings` | Get earnings breakdown | ✅ | VENDOR |
| GET | `/wallet/analytics` | Wallet analytics | ✅ | VENDOR |

---

## 10. PAYOUT ENDPOINTS (10 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/payouts/withdrawal-request` | Create withdrawal request | ✅ | VENDOR |
| GET | `/payouts/withdrawal-request/:requestId` | Get withdrawal request | ✅ | VENDOR |
| GET | `/payouts` | Get vendor payouts | ✅ | VENDOR |
| GET | `/payouts/history` | Get payout history | ✅ | VENDOR |
| PATCH | `/payouts/withdrawal-request/:requestId/process` | Process withdrawal (admin) | ✅ | ADMIN |
| PATCH | `/payouts/withdrawal-request/:requestId/approve` | Approve withdrawal | ✅ | ADMIN |
| PATCH | `/payouts/withdrawal-request/:requestId/reject` | Reject withdrawal | ✅ | ADMIN |
| GET | `/payouts/pending` | Get pending payouts (admin) | ✅ | ADMIN |
| GET | `/payouts/scheduled` | Get scheduled payouts | ✅ | VENDOR |
| GET | `/payouts/analytics` | Payout analytics (admin) | ✅ | ADMIN |

---

## 11. COMMISSION ENDPOINTS (6 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/commission/:vendorId` | Get commission rule | ✅ | ADMIN |
| PUT | `/commission/:vendorId` | Update commission rule | ✅ | ADMIN |
| POST | `/commission/:bookingId/calculate` | Calculate commission | ✅ | ADMIN |
| GET | `/commission/vendor/:vendorId/earnings` | Get vendor commission earnings | ✅ | VENDOR |
| GET | `/commission/all` | Get all commission rules (admin) | ✅ | ADMIN |
| GET | `/commission/report` | Commission report (admin) | ✅ | ADMIN |

---

## 12. REVIEW ENDPOINTS (8 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/reviews/:bookingId` | Create review | ✅ | CUSTOMER |
| GET | `/reviews/equipment/:equipmentId` | Get equipment reviews | ❌ | ALL |
| GET | `/reviews/vendor/:vendorId` | Get vendor reviews | ❌ | ALL |
| GET | `/reviews/:reviewId` | Get review details | ❌ | ALL |
| PUT | `/reviews/:reviewId` | Edit review | ✅ | CUSTOMER |
| DELETE | `/reviews/:reviewId` | Delete review | ✅ | CUSTOMER |
| POST | `/reviews/:reviewId/helpful` | Mark review helpful | ❌ | ALL |
| GET | `/reviews/analytics` | Review analytics (vendor) | ✅ | VENDOR |

---

## 13. SUPPORT ENDPOINTS (10 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/support/ticket` | Create support ticket | ✅ | ALL |
| GET | `/support/ticket/:ticketId` | Get ticket details | ✅ | ALL |
| GET | `/support/tickets` | Get user tickets | ✅ | ALL |
| POST | `/support/ticket/:ticketId/message` | Add ticket message | ✅ | ALL |
| GET | `/support/ticket/:ticketId/messages` | Get ticket messages | ✅ | ALL |
| POST | `/support/ticket/:ticketId/attachment` | Add attachment | ✅ | ALL |
| PATCH | `/support/ticket/:ticketId/close` | Close ticket | ✅ | ALL |
| PATCH | `/support/ticket/:ticketId/reopen` | Reopen ticket | ✅ | ALL |
| GET | `/support/faq` | Get FAQ | ❌ | ALL |
| GET | `/support/analytics` | Support analytics (admin) | ✅ | ADMIN |

---

## 14. REPORT ENDPOINTS (8 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/reports/booking` | Generate booking report | ✅ | VENDOR |
| GET | `/reports/earnings` | Earnings report | ✅ | VENDOR |
| GET | `/reports/commission` | Commission report | ✅ | VENDOR |
| POST | `/reports/export` | Export report (CSV/PDF/Excel) | ✅ | VENDOR |
| GET | `/reports/export/:exportId` | Get export status | ✅ | VENDOR |
| GET | `/reports/list` | Get all reports | ✅ | VENDOR |
| GET | `/reports/analytics` | System analytics (admin) | ✅ | ADMIN |
| DELETE | `/reports/:reportId` | Delete report | ✅ | VENDOR |

---

## 15. ADMIN ENDPOINTS (12 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/admin/dashboard` | Dashboard stats | ✅ | ADMIN |
| GET | `/admin/approvals` | Get pending approvals | ✅ | ADMIN |
| GET | `/admin/logs` | Get system logs | ✅ | ADMIN |
| GET | `/admin/users` | Get all users with filters | ✅ | ADMIN |
| PATCH | `/admin/users/:userId/block` | Block/unblock user | ✅ | ADMIN |
| GET | `/admin/vendors` | Get all vendors | ✅ | ADMIN |
| PATCH | `/admin/vendors/:vendorId/approve` | Approve vendor | ✅ | ADMIN |
| PATCH | `/admin/vendors/:vendorId/reject` | Reject vendor | ✅ | ADMIN |
| GET | `/admin/disputes` | Get all disputes | ✅ | ADMIN |
| GET | `/admin/analytics` | Overall analytics | ✅ | ADMIN |
| GET | `/admin/audit-logs` | Get audit logs | ✅ | ADMIN |
| POST | `/admin/settings/update` | Update system settings | ✅ | ADMIN |

---

## 16. SETTINGS ENDPOINTS (6 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/settings/payment-gateway` | Get payment gateway config | ✅ | ADMIN |
| PUT | `/settings/payment-gateway` | Update payment gateway | ✅ | ADMIN |
| GET | `/settings/app` | Get app settings | ✅ | ADMIN |
| PUT | `/settings/app` | Update app settings | ✅ | ADMIN |
| POST | `/settings/commission-rules` | Set commission rules | ✅ | ADMIN |
| GET | `/settings/commission-rules` | Get commission rules | ✅ | ADMIN |

---

## TOTAL ENDPOINT COUNT: 127 Endpoints

### Breakdown:
- Auth: 10 (existing)
- Users: 5
- Vendors: 10
- Equipment: 12
- Bookings: 12
- Delivery: 5
- Disputes: 8
- Payments: 12
- Wallet: 8
- Payouts: 10
- Commission: 6
- Reviews: 8
- Support: 10
- Reports: 8
- Admin: 12
- Settings: 6

---

## Authentication Header Format
```json
Authorization: Bearer {access_token}
```

## Response Format (Standard)
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

## Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": []
}
```
