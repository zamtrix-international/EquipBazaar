// pages/vendor/VendorBooking/VendorBooking.jsx
import { useCallback, useEffect, useState } from 'react';
import { bookingAPI, deliveryAPI } from '../../../services/api';
import { showConfirm, showSuccess, showError, showInfo } from '../../../utils/sweetalert';
import './VendorBooking.css';

// Status Constants (must match backend exactly)
const BOOKING_STATUSES = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  ACCEPTED: 'ACCEPTED',
  ON_THE_WAY: 'ON_THE_WAY',
  WORK_STARTED: 'WORK_STARTED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REJECTED: 'REJECTED'
};

// Original Booking Status Actions (Vendor Flow)
const STATUS_ACTIONS = {
  PAID: { label: 'Accept', nextStatus: BOOKING_STATUSES.ACCEPTED },
  ACCEPTED: { label: 'On The Way', nextStatus: BOOKING_STATUSES.ON_THE_WAY },
  ON_THE_WAY: { label: 'Start Work', nextStatus: BOOKING_STATUSES.WORK_STARTED },
  WORK_STARTED: { label: 'Mark Delivered', nextStatus: BOOKING_STATUSES.DELIVERED },
};

// Return Status Actions for Vendor (Return Flow)
// Simplified: Vendor only needs to confirm pickup once
const RETURN_STATUS_ACTIONS = {
  RETURN_REQUESTED: { label: 'Confirm Pickup', nextStatus: 'PICKUP_CONFIRMED' },
};

// Helper function to normalize status
const normalizeStatus = (status) => {
  return String(status || '').toUpperCase().trim();
};

// Helper function to check if booking is delivered
const isDelivered = (booking) => {
  return normalizeStatus(booking?.status) === BOOKING_STATUSES.DELIVERED;
};

const VendorBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'returns'

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getVendorBookings({ page: 1, limit: 100 });
      
      console.log('API Response:', response);
      
      // Extract bookings from response
      const bookingsData = 
        response?.data?.data?.bookings ||
        response?.data?.data?.rows ||
        response?.data?.bookings ||
        [];

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      if (!bookingsData?.length) {
        await showInfo('No bookings found', 'Information');
      }
    } catch (err) {
      console.error('Error fetching vendor bookings:', err);
      await showError(
        err.response?.data?.message || err.message || 'Error loading bookings',
        'Fetch Failed'
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  // ========================================
  // UPDATE BOOKING STATUS (Original Vendor Flow)
  // Flow: PAID → ACCEPTED → ON_THE_WAY → WORK_STARTED → DELIVERED
  // ========================================
  const updateBookingStatus = async (bookingId, currentStatus) => {
    const normalizedStatus = normalizeStatus(currentStatus);

    const action = STATUS_ACTIONS[normalizedStatus];
    if (!action) {
      await showInfo('No action available for this booking status', 'Information');
      return;
    }

    const confirmed = await showConfirm(
      `Are you sure you want to ${action.label.toLowerCase()} this booking?`,
      'Confirm Action'
    );
    
    if (!confirmed) {
      return;
    }

    setUpdatingId(bookingId);
    try {
      const response = await bookingAPI.updateStatus(bookingId, action.nextStatus);

      if (response?.data?.success) {
        await showSuccess(
          `Booking ${action.label.toLowerCase()}ed successfully!`,
          'Success'
        );
        await fetchAllBookings();
      } else {
        throw new Error(response?.data?.message || 'Status update failed');
      }
    } catch (err) {
      console.error('Error updating vendor booking status:', err);
      await showError(
        err.response?.data?.message || err.message || 'Error updating status',
        'Update Failed'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ========================================
  // UPDATE RETURN STATUS (Return Flow)
  // Flow: RETURN_REQUESTED → PICKUP_CONFIRMED (via deliveryAPI.confirmPickup)
  // Then customer clicks "Approve Return" in MyBookings
  // Customer approval calls deliveryAPI.confirmReturn()
  // Result: Booking moves from DELIVERED → COMPLETED
  // ========================================
  const updateReturnStatus = async (bookingId, currentReturnStatus) => {
    const normalizedStatus = normalizeStatus(currentReturnStatus);

    const action = RETURN_STATUS_ACTIONS[normalizedStatus];
    if (!action) {
      await showInfo('No action available for this return status', 'Information');
      return;
    }

    const confirmed = await showConfirm(
      'Have you received the return request? Confirm pickup to allow customer return approval.',
      `Confirm ${action.label}`
    );
    
    if (!confirmed) {
      return;
    }

    setUpdatingId(bookingId);
    try {
      // Vendor confirms pickup - this sets pickupDate in DeliveryConfirmation
      const response = await deliveryAPI.confirmPickup(bookingId, {
        confirmedBy: 'vendor',
        confirmedAt: new Date().toISOString(),
        notes: `Vendor confirmed pickup on ${new Date().toLocaleString()}`
      });

      if (response?.data?.success) {
        await showSuccess(
          'Pickup confirmed! Customer can now approve the return.',
          'Return Updated'
        );
        await showInfo(
          'The customer will now review and approve the return. Once approved, the booking will be completed.',
          'Next Step: Customer Approval'
        );
        await fetchAllBookings();
      } else {
        throw new Error(response?.data?.message || 'Pickup confirmation failed');
      }
    } catch (err) {
      console.error('Error confirming pickup:', err);
      await showError(
        err.response?.data?.message || err.message || 'Error confirming pickup',
        'Update Failed'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  const getStatusDisplayName = (status) => {
    if (!status) return 'Pending';
    
    const statusUpper = normalizeStatus(status);
    switch (statusUpper) {
      case BOOKING_STATUSES.PENDING_PAYMENT:
        return 'Pending Payment';
      case BOOKING_STATUSES.PAID:
        return 'Paid - Awaiting Vendor';
      case BOOKING_STATUSES.ACCEPTED:
        return 'Accepted';
      case BOOKING_STATUSES.ON_THE_WAY:
        return 'On The Way';
      case BOOKING_STATUSES.WORK_STARTED:
        return 'Work Started';
      case BOOKING_STATUSES.DELIVERED:
        return 'Delivered - Awaiting Return Approval';
      case BOOKING_STATUSES.COMPLETED:
        return 'Completed';
      case BOOKING_STATUSES.CANCELLED:
        return 'Cancelled';
      case BOOKING_STATUSES.DISPUTED:
        return 'Disputed';
      case BOOKING_STATUSES.REJECTED:
        return 'Rejected';
      default:
        return status || 'Unknown';
    }
  };

  // ========================================
  // DERIVE RETURN FLOW STATUS FROM DELIVERY CONFIRMATION
  // ========================================
  const getComputedReturnStatus = (booking) => {
    const confirmation = booking?.deliveryConfirmation;
    if (!confirmation) return null;

    // If customer has approved, return is complete
    if (confirmation.customerApproved || confirmation.autoApproved) {
      return 'APPROVED_RETURN';
    }

    // If vendor has confirmed pickup, customer can now approve
    if (confirmation.pickupDate) {
      return 'PICKUP_CONFIRMED';
    }

    // If booking is delivered, vendor can confirm pickup
    if (String(booking?.status || '').toUpperCase() === 'DELIVERED') {
      return 'RETURN_REQUESTED';
    }

    return null;
  };

  // ========================================
  // GET RETURN STATUS DISPLAY NAME
  // ========================================
  const getReturnStatusDisplayName = (returnStatus) => {
    if (!returnStatus) return 'No Return Request';
    
    const statusUpper = normalizeStatus(returnStatus);
    switch (statusUpper) {
      case 'RETURN_REQUESTED':
        return '🔁 Return Requested - Awaiting Pickup Confirmation';
      case 'PICKUP_CONFIRMED':
        return '✅ Pickup Confirmed - Awaiting Customer Approval';
      case 'APPROVED_RETURN':
        return '✔️ Return Approved by Customer - Booking Completed';
      default:
        return returnStatus || 'Unknown';
    }
  };

  const getButtonText = (status, isReturn = false) => {
    if (isReturn) {
      const normalizedStatus = normalizeStatus(status);
      // Only show button for pickup confirmation step
      if (normalizedStatus === 'RETURN_REQUESTED') {
        return RETURN_STATUS_ACTIONS.RETURN_REQUESTED?.label;
      }
      return null;
    }
    if (!status) return null;
    const normalizedStatus = normalizeStatus(status);
    return STATUS_ACTIONS[normalizedStatus]?.label || null;
  };

  const canUpdate = (status, isReturn = false) => {
    if (isReturn) {
      if (!status) return false;
      const normalizedStatus = normalizeStatus(status);
      return normalizedStatus === 'RETURN_REQUESTED'; // Only allow pickup confirmation
    }
    if (!status) return false;
    const normalizedStatus = normalizeStatus(status);
    return Boolean(STATUS_ACTIONS[normalizedStatus]);
  };

  // Filter bookings that have active return requests
  const getReturnBookings = () => {
    return bookings.filter((booking) => {
      const returnStatus = getComputedReturnStatus(booking);
      return (
        returnStatus &&
        !['APPROVED_RETURN', 'RETURN_REJECTED', 'REFUND_COMPLETED'].includes(returnStatus)
      );
    });
  };

  // Filter active bookings (without active returns)
  const getActiveBookings = () => {
    return bookings.filter((booking) => {
      const returnStatus = getComputedReturnStatus(booking);
      return (
        !returnStatus ||
        ['APPROVED_RETURN', 'RETURN_REJECTED', 'REFUND_COMPLETED'].includes(returnStatus)
      );
    });
  };

  const renderBookingsTable = (bookingsList, isReturnTable = false) => {
    if (bookingsList.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">{isReturnTable ? '🔁' : '📭'}</div>
          <h3>{isReturnTable ? 'No active returns found' : 'No bookings found'}</h3>
          <p>Try refreshing or check back later</p>
        </div>
      );
    }

    return (
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Equipment</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>{isReturnTable ? 'Return Status' : 'Status'}</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookingsList.map((booking) => {
            const bookingId = booking.id || booking.booking_id;
            const customerName = booking.customer?.name || booking.customerName || 'Customer';
            const status = isReturnTable ? getComputedReturnStatus(booking) : booking.status;
            const buttonText = getButtonText(status, isReturnTable);
            const isUpdating = updatingId === bookingId;
            
            return (
              <tr key={bookingId}>
                <td className="booking-id-cell">
                  <span className="booking-id">#{bookingId}</span>
                </td>
                <td>
                  {booking.equipment?.name || 
                   booking.equipment?.title || 
                   `Equipment #${booking.equipmentId || ''}`}
                </td>
                <td>{customerName}</td>
                <td className="amount-cell">
                  <span className="booking-amount">
                    ₹{booking.totalAmount || booking.amount || 0}
                  </span>
                </td>
                <td className="status-cell">
                  {isReturnTable 
                    ? getReturnStatusDisplayName(status)
                    : getStatusDisplayName(status)
                  }
                </td>
                <td className="action-cell">
                  {canUpdate(status, isReturnTable) && buttonText ? (
                    <button
                      className={`action-btn action-btn-${buttonText.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={() => {
                        if (isReturnTable) {
                          updateReturnStatus(bookingId, status);
                        } else {
                          updateBookingStatus(bookingId, status);
                        }
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <span className="spinner-small"></span> : buttonText}
                    </button>
                  ) : (
                    <span className="no-action">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const returnBookings = getReturnBookings();
  const activeBookings = getActiveBookings();

  return (
    <div className="vendor-booking-page">
      <div className="booking-header">
        <div className="booking-header-content">
          <h1 className="booking-title">📋 My Bookings</h1>
          <p className="booking-subtitle">View and update booking & return status</p>
        </div>
        <button className="refresh-btn" onClick={fetchAllBookings} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          📦 Active Bookings ({activeBookings.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns')}
        >
          🔁 Return Requests ({returnBookings.length})
        </button>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : (
        <div className="bookings-table-wrapper">
          {activeTab === 'active' && renderBookingsTable(activeBookings, false)}
          {activeTab === 'returns' && renderBookingsTable(returnBookings, true)}
        </div>
      )}
    </div>
  );
};

export default VendorBooking;