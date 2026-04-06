# Complete API Documentation for EquipBazaar

Here's a comprehensive list of all API endpoints with the required data fields for each HTTP method. All endpoints are prefixed with `/api`.

## 🔐 Authentication Required
Most endpoints require authentication via JWT token in the `Authorization` header: `Bearer <token>`

---

## 1. Authentication APIs (`/auth`)

### POST `/api/auth/register`
**Body (JSON):**
```json
{
  "name": "string (required, 2-120 chars)",
  "phone": "string (required, 8-20 chars)",
  "email": "string (optional)",
  "password": "string (required, 6-72 chars)",
  "role": "CUSTOMER or VENDOR (optional)",
  "businessName": "string (optional, for vendors)",
  "ownerName": "string (optional, for vendors)",
  "address": "string (optional, for vendors)",
  "city": "string (optional, for vendors)"
}
```

### POST `/api/auth/login`
**Body (JSON):**
```json
{
  "phoneOrEmail": "string (required, 3-180 chars)",
  "password": "string (required, 6-72 chars)"
}
```

---

## 2. Equipment APIs (`/equipment`)

### GET `/api/equipment`
**Query Parameters:**
- `page` (optional): integer, min 1
- `limit` (optional): integer, min 1, max 100

### POST `/api/equipment` *(VENDOR only)*
**Body (JSON):**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "dailyRate": "number (required, min 0)",
  "quantity": "integer (required, min 1)",
  "condition": "NEW or LIKE_NEW or GOOD or FAIR (required)"
}
```

### GET `/api/equipment/vendor/my-equipment` *(VENDOR only)*
**Query Parameters:**
- `page` (optional): integer, min 1
- `limit` (optional): integer, min 1, max 100

### GET `/api/equipment/:equipmentId`

### PUT `/api/equipment/:equipmentId` *(VENDOR only)*
**Body (JSON):**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "dailyRate": "number (optional, min 0)",
  "quantity": "integer (optional, min 0)",
  "isActive": "boolean (optional)"
}
```

### POST `/api/equipment/:equipmentId/images` *(VENDOR only)*
**Content-Type:** `multipart/form-data`
**Body (Form Data):**
- `image`: File (required)

### GET `/api/equipment/:equipmentId/images`

### DELETE `/api/equipment/:equipmentId/images/:imageId` *(VENDOR only)*

### POST `/api/equipment/:equipmentId/availability` *(VENDOR only)*
**Body (JSON):**
```json
{
  "startDate": "ISO8601 date string (required)",
  "endDate": "ISO8601 date string (required)",
  "isAvailable": "boolean (required)"
}
```

### GET `/api/equipment/:equipmentId/availability`

### DELETE `/api/equipment/:equipmentId` *(VENDOR only)*

### GET `/api/equipment/search`
**Query Parameters:**
- `page` (optional): integer, min 1
- `limit` (optional): integer, min 1, max 100
- `category` (optional): string
- `minPrice` (optional): number, min 0
- `maxPrice` (optional): number, min 0
- `location` (optional): string
- `date` (optional): ISO8601 date string

---

## 3. Booking APIs (`/bookings`)

### POST `/api/bookings` *(CUSTOMER only)*
**Body (JSON):**
```json
{
  "equipmentId": "integer (required)",
  "vendorId": "integer (required)",
  "startDate": "ISO8601 date string (required)",
  "endDate": "ISO8601 date string (required)",
  "days": "integer (required, min 1)"
}
```

### GET `/api/bookings`

### GET `/api/bookings/:bookingId`

### PUT `/api/bookings/:bookingId/status` *(CUSTOMER/VENDOR/ADMIN)*
**Body (JSON):**
```json
{
  "newStatus": "PENDING or ACCEPTED or REJECTED or PICKUP_SCHEDULED or PICKED_UP or DELIVERED or RETURNED or COMPLETED or CANCELLED or DISPUTED (required)",
  "reason": "string (optional)"
}
```

### PUT `/api/bookings/:bookingId/cancel` *(CUSTOMER/VENDOR/ADMIN)*

---

## 4. Payment APIs (`/payments`)

### POST `/api/payments/:bookingId/initiate`
**Body (JSON):**
```json
{
  "amount": "number (required, min 0)",
  "paymentMethod": "CARD or UPI or NETBANKING (required)"
}
```

### POST `/api/payments/:paymentId/verify`
**Body (JSON):**
```json
{
  "orderId": "string (required)",
  "paymentId": "string (required)",
  "signature": "string (required)"
}
```

### GET `/api/payments/:paymentId`

---

## 5. User APIs (`/users`)

### GET `/api/users/profile`

### PUT `/api/users/profile`
**Body (JSON):** User profile update data

### GET `/api/users` *(ADMIN only)*

---

## 6. Vendor APIs (`/vendors`)

### POST `/api/vendors` *(VENDOR only)*
**Body (JSON):**
```json
{
  "companyName": "string (required)",
  "description": "string (optional)",
  "phoneNumber": "string (required, valid mobile)",
  "address": "string (required)",
  "city": "string (required)",
  "state": "string (required)",
  "pincode": "string (required, Indian postal code)"
}
```

### GET `/api/vendors/:vendorId`

### PUT `/api/vendors/:vendorId` *(VENDOR only - own profile)*
**Body (JSON):**
```json
{
  "companyName": "string (optional)",
  "description": "string (optional)",
  "phoneNumber": "string (optional, valid mobile)",
  "address": "string (optional)"
}
```

### POST `/api/vendors/:vendorId/kyc` *(VENDOR only - own profile)*
**Content-Type:** `multipart/form-data`
**Body (Form Data):**
- `document`: File (required)
- `documentType`: "AADHAAR or PAN or BUSINESS_LICENSE" (required)

### POST `/api/vendors/:vendorId/bank-account` *(VENDOR only - own profile)*
**Body (JSON):**
```json
{
  "accountNumber": "string (required)",
  "ifscCode": "string (required, 11 chars)",
  "accountHolderName": "string (required)",
  "bankName": "string (required)"
}
```

---

## 7. Commission APIs (`/commission`)

### GET `/api/commission/:vendorId`

### PUT `/api/commission/:vendorId` *(ADMIN only)*
**Body (JSON):** Commission rule data

### POST `/api/commission/:bookingId/calculate`

---

## 8. Wallet APIs (`/wallet`)

### GET `/api/wallet/balance` *(VENDOR only)*

### GET `/api/wallet/ledger` *(VENDOR only)*
**Query Parameters:**
- `page` (optional): integer, min 1
- `limit` (optional): integer, min 1, max 100

---

## 9. Payout APIs (`/payouts`)

### POST `/api/payouts/withdrawal-request` *(VENDOR only)*
**Body (JSON):** Withdrawal request data

### GET `/api/payouts/withdrawal-request/:requestId`

### GET `/api/payouts` *(VENDOR only)*

### PATCH `/api/payouts/withdrawal-request/:requestId/process` *(ADMIN only)*
**Body (JSON):** Processing data

---

## 10. Review APIs (`/review`)

### POST `/api/review/:bookingId`
**Body (JSON):**
```json
{
  "rating": "integer (required, 1-5)",
  "comment": "string (optional)"
}
```

### GET `/api/review/equipment/:equipmentId`
**Query Parameters:**
- `page` (optional): integer, min 1
- `limit` (optional): integer, min 1, max 100

### GET `/api/review/vendor/:vendorId`
**Query Parameters:**
- `page` (optional): integer, min 1
- `limit` (optional): integer, min 1, max 100

---

## 11. Dispute APIs (`/dispute`)

### POST `/api/dispute/:bookingId/dispute`
**Body (JSON):**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "QUALITY or DAMAGE or LATE_RETURN or MISSING_ITEMS or OTHER (required)"
}
```

### GET `/api/dispute/:disputeId`

### POST `/api/dispute/:disputeId/message`
**Body (JSON):** Message data

### PATCH `/api/dispute/:disputeId/resolve` *(ADMIN only)*
**Body (JSON):**
```json
{
  "resolution": "string (required)"
}
```

---

## 12. Delivery APIs (`/delivery`)

### POST `/api/delivery/:bookingId/confirm-pickup`
**Content-Type:** `multipart/form-data`
**Body (Form Data):**
- `photos`: Array of files (optional)

### POST `/api/delivery/:bookingId/confirm-return`
**Content-Type:** `multipart/form-data`
**Body (Form Data):**
- `photos`: Array of files (optional)

### GET `/api/delivery/:bookingId/status`

---

## 13. Support APIs (`/support`)

### POST `/api/support`
**Body (JSON):**
```json
{
  "subject": "string (required)",
  "description": "string (required)",
  "category": "BOOKING or PAYMENT or DELIVERY or OTHER (required)"
}
```

### GET `/api/support`
**Query Parameters:**
- `page` (optional): integer, min 1
- `limit` (optional): integer, min 1, max 100

### GET `/api/support/:ticketId`

### POST `/api/support/:ticketId/message`
**Body (JSON):**
```json
{
  "message": "string (required)"
}
```

### PATCH `/api/support/:ticketId/close`

---

## 14. Report APIs (`/reports`)

### GET `/api/reports/booking` *(VENDOR only)*

### POST `/api/reports/export` *(VENDOR only)*
**Body (JSON):** Export configuration

### GET `/api/reports/export/:exportId` *(VENDOR only)*

### GET `/api/reports` *(VENDOR only)*

---

## 15. Admin APIs (`/admin`)

### GET `/api/admin/dashboard` *(ADMIN only)*

### GET `/api/admin/approvals` *(ADMIN only)*

### GET `/api/admin/logs` *(ADMIN only)*

---

## 16. Settings APIs (`/settings`)

### GET `/api/settings/payment-gateway` *(ADMIN only)*
**Query Parameters:**
- `gateway` (optional): "RAZORPAY" or "CASHFREE"

### PUT `/api/settings/payment-gateway` *(ADMIN only)*
**Body (JSON):**
```json
{
  "gateway": "RAZORPAY or CASHFREE (required)",
  "isEnabled": "boolean (required)",
  "mode": "TEST or LIVE (required)",
  "apiKey": "string (optional)",
  "apiSecret": "string (optional)",
  "webhookSecret": "string (optional)"
}
```

### GET `/api/settings/app` *(ADMIN only)*
**Query Parameters:**
- `keyName` (optional): string, max 120 chars

### PUT `/api/settings/app` *(ADMIN only)*
**Body (JSON):**
```json
{
  "keyName": "string (required, max 120 chars)",
  "valueText": "string (required)"
}
```

---

## 17. Webhook APIs (`/webhook`)

### POST `/api/webhook/razorpay`
**Body:** Raw webhook data from Razorpay

### POST `/api/webhook/cashfree`
**Body:** Raw webhook data from Cashfree

---

## 🔑 Authentication Notes

- **Public endpoints:** `/auth/register`, `/auth/login`, `/webhook/*`
- **Role-based access:** Some endpoints require specific roles (CUSTOMER, VENDOR, ADMIN)
- **JWT Token:** Include in header: `Authorization: Bearer <token>`
- **File uploads:** Use `multipart/form-data` for image/document uploads

## 🧪 Testing Tips

1. **Start with authentication:** Register/Login to get JWT token
2. **Test equipment CRUD:** Create equipment as vendor, then search/browse as customer
3. **Test booking flow:** Create booking, initiate payment, verify payment
4. **Test admin features:** Use admin credentials to access admin endpoints
5. **Check validation:** All required fields must be provided with correct data types

All endpoints return JSON responses with consistent error handling. Use the health check endpoint `/api/health` to verify server status.</content>
<parameter name="filePath">d:\React\EquipBazaarzip\EquipBazaar\API_DOCUMENTATION.md