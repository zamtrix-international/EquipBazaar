// pages/customer/CustomerBookingDetails/CustomerBookingDetails.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, deliveryAPI } from '../../../services/api';
import './CustomerBookingDetails.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const EQUIPMENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Crect x='180' y='90' width='240' height='160' rx='16' fill='%23d1d5db'/%3E%3Ccircle cx='255' cy='155' r='24' fill='%239ca3af'/%3E%3Cpath d='M200 230l60-50 45 35 45-55 50 70' fill='none' stroke='%236b7280' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='300' y='315' text-anchor='middle' font-family='Arial' font-size='28' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";

const getEquipmentImage = (equipment = {}) => {
  const rawImage = equipment.images?.[0]?.url || equipment.image || '';
  if (!rawImage) return EQUIPMENT_PLACEHOLDER;
  if (/^https?:\/\//i.test(rawImage)) return rawImage;
  const normalized = String(rawImage).replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(normalized)) return EQUIPMENT_PLACEHOLDER;
  return normalized.startsWith('/') ? `${API_BASE_URL}${normalized}` : `${API_BASE_URL}/${normalized}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const StatusTimeline = ({ status, booking }) => {
  const statuses = [
    { key: 'PENDING_PAYMENT', label: 'Payment Pending', icon: '💳' },
    { key: 'PAID', label: 'Paid', icon: '✓' },
    { key: 'ACCEPTED', label: 'Accepted', icon: '✓' },
    { key: 'ON_THE_WAY', label: 'On The Way', icon: '🚗' },
    { key: 'WORK_STARTED', label: 'Work Started', icon: '⚙️' },
    { key: 'DELIVERED', label: 'Delivered', icon: '📦' },
    { key: 'COMPLETED', label: 'Completed', icon: '✓' },
  ];

  const getCurrentStatusIndex = () => {
    return statuses.findIndex(s => s.key === status);
  };

  const currentIndex = getCurrentStatusIndex();

  return (
    <div className="status-timeline">
      <h3>Booking Timeline</h3>
      <div className="timeline">
        {statuses.map((s, idx) => (
          <div key={s.key} className={`timeline-item ${idx <= currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''}`}>
            <div className="timeline-dot">{s.icon}</div>
            <div className="timeline-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomerBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');

    try {
      const response = await bookingAPI.getById(id);
      if (response?.data?.success || response?.data?.data) {
        setBooking(response.data.data);
      } else {
        throw new Error('Failed to fetch booking');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleApproveReturn = async () => {
    const confirmed = await showConfirm(
      'Do you approve this return and complete the booking?',
      'Confirm Return'
    );
    if (!confirmed) return;

    setApproving(true);
    try {
      const response = await deliveryAPI.confirmReturn(id, { customerApproved: true });

      if (response?.data?.success) {
        showToast('Return approved and booking completed!', 'success');
        await fetchBooking();
      } else {
        throw new Error(response?.data?.message || 'Approval failed');
      }
    } catch (err) {
      console.error('Error approving return:', err);
      showToast(err?.response?.data?.message || err.message || 'Approval failed', 'error');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-booking-details">
        <div className="container">
          <div className="loader">
            <div className="spinner"></div>
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="customer-booking-details">
        <div className="container">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error || 'Booking not found'}</p>
            <button onClick={() => navigate('/customer/bookings')} className="btn-back">
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const vendorName = booking.vendor?.businessName || booking.vendor?.ownerName || booking.vendor?.name || 'Vendor';
  const equipmentName = booking.equipment?.name || booking.equipment?.title || 'Equipment';
  const isDelivered = String(booking.status || '').toUpperCase() === 'DELIVERED';
  const isCompleted = String(booking.status || '').toUpperCase() === 'COMPLETED';
  const isPickupConfirmed = Boolean(booking.deliveryConfirmation?.pickupDate);

  return (
    <div className="customer-booking-details">
      <div className="container">
        {toast.show && (
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✗'} {toast.message}
          </div>
        )}

        <button onClick={() => navigate('/customer/bookings')} className="btn-back">
          ← Back to Bookings
        </button>

        <div className="booking-header">
          <h1>Booking Details</h1>
          <span className={`status-badge ${String(booking.status || '').toLowerCase()}`}>
            {String(booking.status || '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
          </span>
        </div>

        <div className="booking-grid">
          {/* Equipment Section */}
          <div className="section equipment-section">
            <div className="equipment-card">
              <img
                src={getEquipmentImage(booking.equipment)}
                alt={equipmentName}
                onError={(e) => {
                  e.currentTarget.src = EQUIPMENT_PLACEHOLDER;
                }}
              />
            </div>
            <div className="equipment-info">
              <h3>{equipmentName}</h3>
              <p className="vendor-name">{vendorName}</p>
              <p className="location">📍 {booking.locationText || 'Location not specified'}</p>
            </div>
          </div>

          {/* Booking Info Section */}
          <div className="section booking-info">
            <h3>Booking Information</h3>
            <div className="info-row">
              <label>Booking Code:</label>
              <span>{booking.bookingCode || 'N/A'}</span>
            </div>
            <div className="info-row">
              <label>Service Date:</label>
              <span>{formatDate(booking.serviceDate || booking.startDate)}</span>
            </div>
            {booking.estimatedHours && (
              <div className="info-row">
                <label>Duration:</label>
                <span>{booking.estimatedHours} hours</span>
              </div>
            )}
            {booking.days && (
              <div className="info-row">
                <label>Duration:</label>
                <span>{booking.days} day(s)</span>
              </div>
            )}
            <div className="info-row">
              <label>Special Notes:</label>
              <span>{booking.notes || 'None'}</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="section payment-section">
            <h3>Payment Breakdown</h3>
            <div className="payment-row">
              <label>Subtotal:</label>
              <span>{formatCurrency(booking.subtotal)}</span>
            </div>
            <div className="payment-row">
              <label>Extra Charges:</label>
              <span>{formatCurrency(booking.extraCharges)}</span>
            </div>
            <div className="payment-divider"></div>
            <div className="payment-row total">
              <label>Total Amount:</label>
              <span>{formatCurrency(booking.totalAmount)}</span>
            </div>
            {/* Commission section removed for customers */}
          </div>

          {/* Status Timeline */}
          <div className="section timeline-section">
            <StatusTimeline status={booking.status} booking={booking} />
          </div>

          {/* Action Section */}
          {isDelivered && !isCompleted && (
            <div className="section action-section">
              <div className="action-card">
                <h3>Equipment Delivered</h3>
                <p>The equipment has been delivered. Please inspect it and confirm the return to complete the booking.</p>
                <button
                  onClick={handleApproveReturn}
                  disabled={approving}
                  className="btn-approve"
                >
                  {approving ? 'Confirming...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="section action-section">
              <div className="action-card success">
                <h3>✓ Booking Completed</h3>
                <p>This booking has been successfully completed and confirmed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingDetails;