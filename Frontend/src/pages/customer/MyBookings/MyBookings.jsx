/**
 * MyBookings Component - COMPLETE IMPLEMENTATION
 * 
 * BOOKING LIFECYCLE FLOW:
 * 1. Customer creates booking (PENDING_PAYMENT)
 * 2. Customer pays for booking (PAID)
 * 3. Vendor accepts booking (ACCEPTED)
 * 4. Vendor marks: ON_THE_WAY → WORK_STARTED → DELIVERED
 * 5. Customer sees DELIVERED status and clicks "Approve Return"
 * 6. Customer approval calls confirmReturn API (moves to COMPLETED)
 * 
 * KEY FEATURES:
 * - Correct API calling sequence
 * - Status-based button visibility (Approve Return only on DELIVERED)
 * - Real-time status updates
 * - Proper error handling
 * - Loading states on buttons
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, deliveryAPI } from '../../../services/api';
import './MyBookings.css';

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

// Icons
const Icons = {
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Times: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Exclamation: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  CalendarTimes: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <line x1="15" y1="14" x2="9" y2="20"></line>
      <line x1="9" y1="14" x2="15" y2="20"></line>
    </svg>
  )
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const EQUIPMENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Crect x='180' y='90' width='240' height='160' rx='16' fill='%23d1d5db'/%3E%3Ccircle cx='255' cy='155' r='24' fill='%239ca3af'/%3E%3Cpath d='M200 230l60-50 45 35 45-55 50 70' fill='none' stroke='%236b7280' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='300' y='315' text-anchor='middle' font-family='Arial' font-size='28' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";

const getCachedEquipmentImage = (equipmentId) => {
  try {
    const cache = JSON.parse(window.localStorage.getItem('equipmentImageCache') || '{}');
    return equipmentId ? cache[String(equipmentId)] || '' : '';
  } catch {
    return '';
  }
};

const resolveEquipmentImage = (booking = {}) => {
  const equipmentId = booking.equipment?.id || booking.equipmentId;
  const rawImage =
    booking.image ||
    booking.equipment?.images?.[0]?.url ||
    booking.equipment?.images?.[0]?.imageUrl ||
    booking.equipmentId?.images?.[0]?.url ||
    booking.equipmentId?.images?.[0]?.imageUrl ||
    getCachedEquipmentImage(equipmentId) ||
    '';

  if (!rawImage) return EQUIPMENT_PLACEHOLDER;
  if (/^https?:\/\//i.test(rawImage) || String(rawImage).startsWith('data:')) return rawImage;

  const normalizedPath = String(rawImage).replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(normalizedPath)) return getCachedEquipmentImage(equipmentId) || EQUIPMENT_PLACEHOLDER;

  return normalizedPath.startsWith('/')
    ? `${API_BASE_URL}${normalizedPath}`
    : `${API_BASE_URL}/${normalizedPath}`;
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [approvingBookingId, setApprovingBookingId] = useState(null);
  
  const navigate = useNavigate();

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const showToastMessage = useCallback((message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  /**
   * Normalize status string - ensure uppercase
   */
  const normalizeStatus = (status) => {
    return String(status || '').toUpperCase().trim();
  };

  /**
   * Check if booking is in DELIVERED status
   */
  const isDelivered = (booking) => {
    const status = normalizeStatus(booking?.status);
    return status === BOOKING_STATUSES.DELIVERED;
  };

  /**
   * Check if booking is in COMPLETED status
   */
  const isCompleted = (booking) => {
    const status = normalizeStatus(booking?.status);
    return status === BOOKING_STATUSES.COMPLETED;
  };

  /**
   * Check if vendor pickup has been confirmed for the return flow
   */
  const isPickupConfirmed = (booking) => {
    return Boolean(booking?.deliveryConfirmation?.pickupDate);
  };

  /**
   * Check if booking is pending payment
   */
  const isPendingPayment = (booking) => {
    const status = normalizeStatus(booking?.status);
    return status === BOOKING_STATUSES.PENDING_PAYMENT || status === 'PENDING' || status === 'REQUESTED';
  };

  /**
   * Get safe booking ID with fallbacks
   */
  const getBookingId = (booking) => {
    return booking?.id || booking?._id || booking?.booking_id;
  };

  /**
   * Get booking equipment name
   */
  const getEquipmentName = (booking) => {
    return booking?.equipment?.name ||
      booking?.equipment?.title ||
      booking?.equipmentName ||
      booking?.equipmentId?.name ||
      'Equipment';
  };

  /**
   * Get vendor name from booking
   */
  const getVendorName = (booking) => {
    return booking?.vendor?.businessName ||
      booking?.vendor?.ownerName ||
      booking?.vendor?.name ||
      booking?.vendorName ||
      booking?.vendorId?.name ||
      'Vendor';
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  /**
   * Format status for display (e.g., ON_THE_WAY → On The Way)
   */
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return String(status)
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Get CSS class for status styling
   */
  const getStatusClass = (status) => {
    const s = normalizeStatus(status);
    const statusMap = {
      'PENDING_PAYMENT': 'status-pending',
      'PAID': 'status-confirmed',
      'ACCEPTED': 'status-confirmed',
      'ON_THE_WAY': 'status-progress',
      'WORK_STARTED': 'status-progress',
      'DELIVERED': 'status-progress',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'DISPUTED': 'status-disputed',
      'REJECTED': 'status-cancelled'
    };
    return statusMap[s] || 'status-default';
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Get booking duration
   */
  const getBookingDuration = (booking) => {
    if (booking?.duration) return booking.duration;
    if (booking?.estimatedHours) return `${booking.estimatedHours} hours`;
    if (booking?.days) return `${booking.days} day${Number(booking.days) > 1 ? 's' : ''}`;
    return `${booking?.hours || 1} hours`;
  };

  /**
   * Get booking total amount
   */
  const getBookingAmount = (booking) => {
    return booking?.totalAmount || booking?.amount || 0;
  };

  // ========================================
  // API CALLS
  // ========================================

  /**
   * Fetch all bookings for the customer
   */
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filter !== 'all' && { status: filter })
      };

      const response = await bookingAPI.getMyBookings(params);
      
      // Extract bookings from various possible response structures
      let bookingsData = [];
      let totalCount = 0;
      let pagesCount = 0;

      if (response?.data) {
        const resData = response.data;

        if (resData.data?.bookings && Array.isArray(resData.data.bookings)) {
          bookingsData = resData.data.bookings;
          totalCount = resData.data.total || bookingsData.length;
          pagesCount = resData.data.pages || Math.ceil(totalCount / pagination.limit);
        } else if (resData.bookings && Array.isArray(resData.bookings)) {
          bookingsData = resData.bookings;
          totalCount = resData.total || bookingsData.length;
          pagesCount = resData.pages || Math.ceil(totalCount / pagination.limit);
        } else if (resData.data && Array.isArray(resData.data)) {
          bookingsData = resData.data;
          totalCount = resData.total || bookingsData.length;
          pagesCount = resData.pages || Math.ceil(totalCount / pagination.limit);
        } else if (Array.isArray(resData)) {
          bookingsData = resData;
          totalCount = bookingsData.length;
          pagesCount = Math.ceil(totalCount / pagination.limit);
        } else if (resData.rows && Array.isArray(resData.rows)) {
          bookingsData = resData.rows;
          totalCount = resData.count || bookingsData.length;
          pagesCount = resData.pages || Math.ceil(totalCount / pagination.limit);
        }
      }

      setBookings(bookingsData);
      setPagination(prev => ({
        ...prev,
        total: totalCount,
        pages: pagesCount > 0 ? pagesCount : 1
      }));
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page, pagination.limit]);

  /**
   * MAIN API: Approve return and complete booking
   * Prerequisites:
   * 1. Booking status must be DELIVERED
   * 2. Delivery confirmation must exist in backend
   * 3. Customer must be the booking creator
   * 
   * This API call:
   * - POST /delivery/:bookingId/confirm-return
   * - Payload: { customerApproved: true }
   * - Result: Booking moves from DELIVERED → COMPLETED
   */
  const handleApproveReturn = async (bookingId) => {
    if (!bookingId) {
      console.error('handleApproveReturn: Missing bookingId');
      showToastMessage('Cannot approve return: booking ID is missing', 'error');
      return;
    }

    const confirmed = await showConfirm(
      'Do you approve this return and complete the booking?',
      'Confirm Return'
    );
    if (!confirmed) return;

    setApprovingBookingId(bookingId);

    try {
      const response = await deliveryAPI.confirmReturn(bookingId, { customerApproved: true });

      if (response?.data?.success) {
        showToastMessage('Return approved successfully! Booking is now completed.', 'success');
        await fetchBookings();
      } else {
        throw new Error(response?.data?.message || 'Failed to approve return');
      }
    } catch (err) {
      console.error('Error approving return:', err);
      let errorMessage = 'Failed to approve return';

      if (err.response?.status === 404) {
        errorMessage = 'Delivery confirmation not found. Please contact vendor to confirm delivery.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to approve this return.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showToastMessage(errorMessage, 'error');
    } finally {
      setApprovingBookingId(null);
    }
  };

  /**
   * Cancel booking (only for PENDING_PAYMENT status)
   */
  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to cancel this booking?',
      'Cancel Booking'
    );
    if (!confirmed) return;

    try {
      const response = await bookingAPI.updateStatus(bookingId, BOOKING_STATUSES.CANCELLED);

      if (response?.data?.success) {
        showToastMessage('Booking cancelled successfully', 'success');
        await fetchBookings();
      } else {
        throw new Error(response?.data?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showToastMessage(err.message || 'Failed to cancel booking', 'error');
    }
  };

  /**
   * Navigate to booking details page
   */
  const handleViewDetails = (bookingId) => {
    if (bookingId) {
      navigate(`/customer/bookings/${bookingId}`);
    }
  };

  /**
   * Navigate to payment page
   */
  const handleProceedToPayment = (bookingId) => {
    if (bookingId) {
      navigate(`/customer/payment/${bookingId}`);
    }
  };

  /**
   * Retry loading bookings
   */
  const handleRetry = () => {
    fetchBookings();
  };

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ========================================
  // RENDER
  // ========================================

  if (loading && bookings.length === 0) {
    return (
      <div className="my-bookings-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`toast-notification ${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✗'} {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          {bookings.length > 0 && (
            <p className="bookings-count">
              Showing {bookings.length} of {pagination.total} bookings
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <Icons.Exclamation />
            <p>{error}</p>
            <button onClick={handleRetry} className="btn-retry">
              Try Again
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['all', 'pending_payment', 'paid', 'accepted', 'delivered', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'active' : ''} ${getStatusClass(tab)}`}
              onClick={() => {
                setFilter(tab);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              {formatStatus(tab)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="bookings-container">
          {bookings.length > 0 ? (
            <>
              {bookings.map(booking => {
                const bId = getBookingId(booking);
                const isApproving = approvingBookingId === bId;
                const showApproveReturn = isDelivered(booking) && !isCompleted(booking);

                return (
                  <div key={bId} className="booking-card">
                    {/* Image */}
                    <div className="booking-image">
                      <img
                        src={resolveEquipmentImage(booking)}
                        alt={getEquipmentName(booking)}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = EQUIPMENT_PLACEHOLDER;
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="booking-details">
                      <div className="booking-header">
                        <div>
                          <h3>{getEquipmentName(booking)}</h3>
                          <p className="booking-vendor">{getVendorName(booking)}</p>
                        </div>
                        <span className={`booking-status ${getStatusClass(booking.status)}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </div>

                      <div className="booking-info">
                        <p>
                          <Icons.Calendar />
                          {formatDate(booking.serviceDate || booking.startDate || booking.createdAt)}
                        </p>
                        <p>
                          <Icons.Clock />
                          {getBookingDuration(booking)}
                        </p>
                        <p>
                          <Icons.User />
                          {getVendorName(booking)}
                        </p>
                      </div>

                      <div className="booking-footer">
                        <div className="booking-amount">
                          <span>Total Amount:</span>
                          <strong>{formatCurrency(getBookingAmount(booking))}</strong>
                        </div>

                        <div className="booking-actions">
                          {/* Pay Now Button - for PENDING_PAYMENT status */}
                          {isPendingPayment(booking) && (
                            <>
                              <button
                                className="btn-pay"
                                onClick={() => handleProceedToPayment(bId)}
                              >
                                <Icons.CheckCircle />
                                <span>Pay Now</span>
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={() => handleCancelBooking(bId)}
                              >
                                <Icons.Times />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {/* View Details - Available for all bookings */}
                          <button
                            className="btn-view"
                            onClick={() => handleViewDetails(bId)}
                          >
                            <Icons.Eye />
                            <span>View Details</span>
                          </button>

                          {/* MAIN BUTTON: Confirm Return - only when status = DELIVERED */}
                          {showApproveReturn && (
                            <button
                              className="btn-approve"
                              onClick={() => handleApproveReturn(bId)}
                              disabled={isApproving}
                            >
                              {isApproving ? (
                                <>
                                  <Icons.Spinner />
                                  <span>Confirming...</span>
                                </>
                              ) : (
                                <>
                                  <Icons.CheckCircle />
                                  <span>Confirm Return</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Completed Indicator */}
                          {isCompleted(booking) && (
                            <div className="booking-completed-badge">
                              ✓ Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    ← Previous
                  </button>

                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button
                    className="pagination-btn"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="empty-state">
              <div className="empty-icon">
                <Icons.CalendarTimes />
              </div>
              <h3>No bookings found</h3>
              <p>
                {filter !== 'all'
                  ? `You don't have any ${formatStatus(filter)} bookings yet`
                  : "You haven't made any bookings yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
