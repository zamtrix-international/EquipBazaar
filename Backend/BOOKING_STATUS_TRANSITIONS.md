# Booking Status Transitions & Workflow

## 1. BOOKING STATUS TRANSITIONS TABLE

| Current Status | Allowed Next States | Trigger | Role | Notes |
|----------------|-------------------|---------|------|-------|
| **PENDING** | ACCEPTED, REJECTED, CANCELLED | Vendor accepts/rejects or customer cancels | VENDOR, CUSTOMER | Initial state after booking creation |
| **ACCEPTED** | PICKUP_SCHEDULED, CANCELLED | Vendor schedules pickup or booking cancelled | VENDOR, CUSTOMER | Customer can still cancel with charges |
| **PICKUP_SCHEDULED** | PICKED_UP, CANCELLED | Vendor marks as picked up or cancel | VENDOR, CUSTOMER | No cancellation allowed after this |
| **PICKED_UP** | DELIVERED, DISPUTED | Equipment delivered or issue raised | VENDOR | Once picked up, no cancellation |
| **DELIVERED** | RETURNED, DISPUTED | Customer returns or raises dispute | CUSTOMER, VENDOR | Normally expected after rental period |
| **RETURNED** | COMPLETED, DISPUTED | Inspection done or dispute raised | VENDOR | Final check before completion |
| **DISPUTED** | RESOLVED, REJECTED | Admin resolves or rejects claim | ADMIN | Holds payment/payout processing |
| **COMPLETED** | - | Auto or manual completion | SYSTEM/ADMIN | Final state - payment processed |
| **CANCELLED** | - | Booking cancelled at any stage | CUSTOMER/VENDOR/ADMIN | Final state - refund issued |
| **REJECTED** | - | Vendor rejects booking | VENDOR | Final state - refund issued |

---

## 2. DETAILED STATUS WORKFLOW

```
                    ┌─────────────────────────────────────────────┐
                    │        BOOKING CREATED (PENDING)            │
                    │  Customer requests equipment rental         │
                    └──────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼────────┐          ┌────────▼────────┐
            │  ACCEPTED      │          │   REJECTED      │
            │  (by Vendor)   │          │  (by Vendor)    │
            └───────┬────────┘          └────────┬────────┘
                    │                            │
         ┌──────────▼──────────┐                 │
         │PICKUP_SCHEDULED     │                 │
         │(Vendor sets date)   │                 │
         └──────────┬──────────┘                 │
                    │                            │
         ┌──────────▼──────────┐                 │
         │   PICKED_UP        │                  │
         │(Customer confirms) │                  │
         └──────────┬──────────┘                 │
                    │                            │
         ┌──────────▼──────────┐                 │
         │   DELIVERED        │                  │
         │(After rental end)  │                  │
         └──────────┬──────────┘                 │
                    │                            │
         ┌──────────▼──────────┐                 │
         │   RETURNED         │                  │
         │(Vendor inspection) │                  │
         └──────────┬──────────┘                 │
                    │                            │
         ┌──────────▼──────────┐                 │
         │   COMPLETED        │                  │
         │(Payment processed) │                  │
         └────────────────────┘                  │
                                                 │
        ┌────────────────────────────────────────┘
        │
        └──────────────────────┐
                               │
                    ┌──────────▼───────────┐
                    │   CANCELLED         │
                    │  (Full/Partial      │
                    │   Refund)           │
                    └─────────────────────┘

Alternative Path (Disputes):
Any Status → DISPUTED → RESOLVED → COMPLETED
           → DISPUTED → REJECTED → CANCELLED
```

---

## 3. STATE TRANSITION RULES

### Rule 1: PENDING → ACCEPTED
- **Trigger**: Vendor accepts the booking request
- **Conditions**:
  - Equipment must be available for requested dates
  - Vendor must be verified and active
  - No conflicting bookings
- **Actions**:
  - Booking status changes to ACCEPTED
  - Email confirmation sent to customer
  - Payment can now be initiated
- **Reversal**: Can cancel with 100% refund

### Rule 2: ACCEPTED → PICKUP_SCHEDULED
- **Trigger**: Vendor schedules pickup date/time
- **Conditions**:
  - Booking must be ACCEPTED
  - Pickup date must be before or on rental start date
- **Actions**:
  - Pickup details (date, time, location) confirmed
  - SMS/Email notification to customer
  - Payment should be completed
- **Reversal**: Can cancel with 80% refund

### Rule 3: PICKUP_SCHEDULED → PICKED_UP
- **Trigger**: Vendor confirms equipment pickup
- **Conditions**:
  - Booking must be PICKUP_SCHEDULED
  - Vendor can only pick up on scheduled date
- **Actions**:
  - Pickup photos uploaded
  - Equipment condition documented
  - Rental period officially starts
- **Reversal**: Cannot be reversed

### Rule 4: PICKED_UP → DELIVERED
- **Trigger**: Automatically triggered after rental end date
- **Conditions**:
  - Current date >= rental end date
  - Booking must be PICKED_UP
- **Actions**:
  - Awaiting customer to return equipment
  - Further charges if extended
  - Return instructions sent to customer
- **Note**: Can transition to DISPUTED if issues arise

### Rule 5: DELIVERED → RETURNED
- **Trigger**: Customer confirms return/equipment returned
- **Conditions**:
  - Equipment physically returned
  - Booking must be DELIVERED
- **Actions**:
  - Return photos/condition uploaded
  - Vendor inspects condition
  - Charges finalized (late fees, damage, etc.)
- **Note**: If equipment damaged/missing → DISPUTED

### Rule 6: RETURNED → COMPLETED
- **Trigger**: Vendor confirms inspection, no issues
- **Conditions**:
  - Equipment returned and inspected
  - No damages or disputes
  - All charges settled
- **Actions**:
  - Final amount calculated
  - Commission deducted
  - Vendor wallet credited
  - Payout request created
  - Booking marked COMPLETED
- **Next Step**: Vendor can process withdrawal request

### Rule 7: ANY → DISPUTED
- **Trigger**: Either party raises a dispute
- **Allowed from**: DELIVERED, RETURNED, PICKED_UP
- **Conditions**:
  - Valid dispute reason provided
  - Evidence/attachments uploaded
- **Actions**:
  - Dispute created with tracking ID
  - Admin notified
  - Payment/payout on hold
  - Communication channel opened
- **Duration**: 14 days to resolve

### Rule 8: DISPUTED → RESOLVED
- **Trigger**: Admin resolves the dispute
- **Conditions**:
  - Admin reviews evidence from both parties
  - Decision made on claim validity
- **Actions**:
  - If APPROVED: Refund to customer, debit from vendor
  - If REJECTED: Booking → COMPLETED normally
  - Both parties notified
  - Evidence archived

### Rule 9: ANY → CANCELLED
- **Trigger**: Customer or vendor cancels
- **Conditions**:
  - Status must allow cancellation (see table above)
- **Refund Policy**:
  - PENDING: 100% refund
  - ACCEPTED: 80% refund + 20% platform fee
  - PICKUP_SCHEDULED: 50% refund + 50% platform fee
  - Beyond: No refund (equipment rented)
- **Actions**:
  - Booking marked CANCELLED
  - Refund amount calculated
  - Issue refund to customer
  - Notify vendor

### Rule 10: PENDING → REJECTED
- **Trigger**: Vendor rejects booking request
- **Conditions**:
  - Vendor explicitly rejects
- **Actions**:
  - Booking marked REJECTED
  - Full refund to customer
  - Booking removed from both dashboards
  - Reason recorded for analytics

---

## 4. CANCELLATION CHARGES POLICY

| Status | Refund % | Platform Fee % | Conditions |
|--------|----------|---|---|
| PENDING | 100% | 0% | Refund immediately |
| ACCEPTED | 80% | 20% | Before pickup |
| PICKUP_SCHEDULED | 50% | 50% | Very close to pickup |
| PICKED_UP | 0% | 100% | Equipment in use |
| DELIVERED | 0% | 100% | Equipment returned |
| RETURNED | 0% | 100% | After inspection |
| COMPLETED | N/A | N/A | Booking finished |
| DISPUTED | On Hold | - | Until resolution |

---

## 5. PAYMENT HOLD & RELEASE TIMELINE

```
Timeline: 0 ────────── Rental ────────── 7 ────── 14 ────── 21
          Days        Period         Days      Days     Days

         PENDING → ACCEPTED → PICKED_UP → DELIVERED → COMPLETED
         Pay: ─────────────────────────────────────────────────→
         Hold ─┬──────────────────────────────────────────┐
               └──────────────────────────────────────────┘
         Release: After RETURNED + 7 days (no disputes)
```

---

## 6. NOTIFICATION FLOW

| Transition | Customer Notification | Vendor Notification | Admin Notification |
|-----------|-----|-----|-----|
| PENDING → ACCEPTED | ✅ Booking accepted | - | - |
| ACCEPTED → PICKUP_SCHEDULED | ✅ Pickup date set | ✅ Pickup confirmed | - |
| PICKUP_SCHEDULED → PICKED_UP | ✅ Equipment picked up | - | - |
| PICKED_UP → DELIVERED | ✅ Return it now | - | - |
| DELIVERED → RETURNED | - | ✅ Received return | - |
| RETURNED → COMPLETED | ✅ Booking complete | ✅ Payment credited | - |
| ANY → DISPUTED | ✅ Dispute created | ✅ Dispute created | ✅ Review needed |
| DISPUTED → RESOLVED | ✅ Results notified | ✅ Results notified | - |
| ANY → CANCELLED | ✅ Refunded | ✅ Cancelled | - |
| PENDING → REJECTED | ✅ Rejected msg | - | - |

---

## 7. DATABASE STATUS VALUES

```javascript
// Book status constants
PENDING = 'PENDING'
ACCEPTED = 'ACCEPTED'
REJECTED = 'REJECTED'
PICKUP_SCHEDULED = 'PICKUP_SCHEDULED'
PICKED_UP = 'PICKED_UP'
DELIVERED = 'DELIVERED'
RETURNED = 'RETURNED'
COMPLETED = 'COMPLETED'
CANCELLED = 'CANCELLED'
DISPUTED = 'DISPUTED'
RESOLVED = 'RESOLVED'
```

---

## 8. IMPLEMENTATION CHECKLIST

### Backend Implementation
- [ ] Create `BookingStatusLog` model to track all transitions
- [ ] Implement validation rules in `bookingStatus.service.js`
- [ ] Add timestamps for each status change
- [ ] Log state transitions with reason/comment
- [ ] Implement state transition API endpoint
- [ ] Add webhook triggers for status changes
- [ ] Create scheduled jobs for auto-transitions (DELIVERED, RESOLVED)
- [ ] Implement refund calculation logic based on status
- [ ] Add dispute creation at critical points
- [ ] Create audit trail for all transitions

### Frontend Implementation
- [ ] Display current status badge
- [ ] Show allowed actions for current status
- [ ] Display timeline of all transitions
- [ ] Show estimated payouts on COMPLETED
- [ ] Display dispute form when applicable
- [ ] Show cancellation charges before confirming cancel
- [ ] Display "Mark as returned" button for customer at DELIVERED
- [ ] Display "Inspect & complete" button for vendor at RETURNED

### Testing Scenarios
- [ ] Test happy path: PENDING → COMPLETED
- [ ] Test cancellation at each stage
- [ ] Test dispute creation and resolution
- [ ] Test refund calculations
- [ ] Test payment hold/release
- [ ] Test notifications at each stage
- [ ] Test role-based access control
- [ ] Test edge cases (expired bookings, etc.)

---

## 9. EDGE CASES & SPECIAL SCENARIOS

### Scenario 1: Customer doesn't return equipment on time
- DELIVERED status extended daily
- Late charges applied (₹100/day default)
- After 7 days: Auto-escalate to DISPUTED

### Scenario 2: Equipment returned damaged
- RETURNED → DISPUTED (by vendor)
- Admin reviews photos
- Damage charges deducted from vendor payout

### Scenario 3: Customer requests extension
- DELIVERED status can be extended
- New return date calculated
- Additional charges applied

### Scenario 4: Equipment never picked up
- Auto-cancel after 48 hours of PICKUP_SCHEDULED
- Full refund to customer
- Notification sent

### Scenario 5: Disputed claim not resolved within 14 days
- Auto-resolve in favor of customer
- Full refund issued
- Case closed

---

## 10. RELATED MODELS & FIELDS

### Booking Model
```javascript
{
  id: UUID,
  customerId: FK(User),
  vendorId: FK(User),
  equipmentId: FK(Equipment),
  status: STRING (enum),
  startDate: DATE,
  endDate: DATE,
  totalAmount: DECIMAL,
  paidAmount: DECIMAL,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### BookingStatusLog Model
```javascript
{
  id: UUID,
  bookingId: FK(Booking),
  previousStatus: STRING,
  currentStatus: STRING,
  reason: STRING,
  comment: TEXT,
  changedBy: FK(User),
  metadata: JSON,
  createdAt: TIMESTAMP
}
```

### Payment Model
```javascript
{
  id: UUID,
  bookingId: FK(Booking),
  amount: DECIMAL,
  status: STRING (INITIATED, SUCCESS, FAILED),
  transactionId: STRING,
  paymentMethod: STRING,
  gatewayResponse: JSON,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

