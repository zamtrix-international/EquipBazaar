// pages/customer/BookingSuccess/BookingSuccess.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import './BookingSuccess.css';

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { bookingId, equipment, total, date, duration, hours, paymentId, isCash } = state || {};

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDurationLabel = () => {
    if (duration === 'hourly') return `${hours} ghante`;
    if (duration === 'daily') return '1 din';
    if (duration === 'weekly') return '1 hafta';
    return duration || '—';
  };

  // ── No data guard ──────────────────────────────────────────────────────────
  if (!bookingId) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="no-data">
            <span className="no-data-icon">⚠️</span>
            <h2>Page Refresh Mat Karo</h2>
            <p>Booking data nahi mila. My Bookings mein jakar dekho.</p>
            <button className="btn-primary" onClick={() => navigate('/customer/bookings')}>
              My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">

        {/* ── Success Icon + Title ── */}
        <div className="success-header">
          <div className="success-icon-wrapper">
            <div className="success-icon">✓</div>
          </div>
          <h1 className="success-title">
            {isCash ? 'Booking Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className="success-subtitle">
            {isCash
              ? 'Tumhari booking ho gayi. Equipment delivery par cash mein pay karna.'
              : 'Payment ho gayi aur booking confirm ho gayi.'}
          </p>
        </div>

        {/* ── Booking Details Card ── */}
        <div className="success-card">
          <div className="success-card-header">
            <span className="booking-id-label">Booking ID</span>
            <span className="booking-id-value">#{bookingId}</span>
          </div>

          <div className="success-details">
            <div className="detail-row">
              <span className="detail-label">Equipment</span>
              <span className="detail-value">{equipment?.name || '—'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Tarikh</span>
              <span className="detail-value">{formatDate(date)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Duration</span>
              <span className="detail-value">{getDurationLabel()}</span>
            </div>

            {!isCash && paymentId && (
              <div className="detail-row">
                <span className="detail-label">Payment ID</span>
                <span className="detail-value payment-id-text">{paymentId}</span>
              </div>
            )}

            <div className="detail-row total-row">
              <span className="detail-label">
                {isCash ? 'Amount (Cash mein dena)' : 'Amount Paid'}
              </span>
              <span className="detail-value amount-value">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment method badge */}
          <div className="payment-badge-row">
            <span className={`payment-badge ${isCash ? 'badge-cash' : 'badge-online'}`}>
              {isCash ? '💵 Cash on Delivery' : '✅ Online Payment'}
            </span>
          </div>
        </div>

        {/* ── What's Next ── */}
        <div className="next-steps">
          <h3 className="next-steps-title">Aage kya hoga?</h3>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-text">
                <strong>Vendor ko notification milegi</strong>
                <span>Vendor tumhari booking review karega aur confirm karega</span>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-text">
                <strong>Equipment delivery hogi</strong>
                <span>Confirm hone ke baad equipment selected date par bheja jayega</span>
              </div>
            </div>
            {isCash && (
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-text">
                  <strong>Delivery par payment karo</strong>
                  <span>
                    Equipment milne par <strong>{formatCurrency(total)}</strong> cash mein do
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="success-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/customer/bookings')}
          >
            My Bookings Dekho
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/equipment')}
          >
            Aur Equipment Dekho
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingSuccess;
