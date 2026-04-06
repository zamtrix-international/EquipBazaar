// pages/customer/ReviewBooking/ReviewBooking.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../../../services/api';
import './ReviewBooking.css';

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

const ReviewBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [review, setReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

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
        const bookingData = response.data.data;
        
        // Check if booking is completed
        if (String(bookingData.status || '').toUpperCase() !== 'COMPLETED') {
          setError('Only completed bookings can be reviewed.');
          setTimeout(() => navigate('/customer/bookings'), 3000);
          return;
        }
        
        setBooking(bookingData);
      } else {
        throw new Error('Failed to fetch booking');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!review.rating || !review.title.trim() || !review.comment.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await reviewAPI.createReview(id, {
        rating: Number(review.rating),
        title: review.title.trim(),
        comment: review.comment.trim(),
      });

      if (response?.data?.success) {
        showToast('Review submitted successfully!', 'success');
        setTimeout(() => navigate('/customer/bookings'), 2000);
      } else {
        throw new Error(response?.data?.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      showToast(
        err?.response?.data?.message || err.message || 'Failed to submit review',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="review-booking-page">
        <div className="container">
          <div className="loader">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-booking-page">
        <div className="container">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/customer/bookings')} className="btn-back">
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="review-booking-page">
        <div className="container">
          <div className="error-container">
            <p>Booking not found</p>
            <button onClick={() => navigate('/customer/bookings')} className="btn-back">
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const equipmentName = booking.equipment?.name || 'Equipment';
  const vendorName = booking.vendor?.businessName || booking.vendor?.ownerName || 'Vendor';

  return (
    <div className="review-booking-page">
      <div className="container">
        {toast.show && (
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✗'} {toast.message}
          </div>
        )}

        <button onClick={() => navigate('/customer/bookings')} className="btn-back">
          ← Back to Bookings
        </button>

        <div className="review-header">
          <h1>Write Your Review</h1>
          <p>Share your experience with this equipment</p>
        </div>

        <div className="review-container">
          {/* Equipment Section */}
          <div className="equipment-section">
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
              <div className="booking-details">
                <small>Booking Code: {booking.bookingCode}</small>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form className="review-form" onSubmit={handleSubmitReview}>
            <div className="form-section">
              <label className="form-label">Rating *</label>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`star ${star <= review.rating ? 'active' : ''}`}
                    onClick={() => setReview({ ...review, rating: star })}
                  >
                    ★
                  </div>
                ))}
              </div>
              <p className="rating-text">
                {review.rating === 1 && 'Poor'}
                {review.rating === 2 && 'Not Good'}
                {review.rating === 3 && 'Fair'}
                {review.rating === 4 && 'Good'}
                {review.rating === 5 && 'Excellent'}
              </p>
            </div>

            <div className="form-section">
              <label htmlFor="title" className="form-label">Review Title *</label>
              <input
                id="title"
                type="text"
                value={review.title}
                onChange={(e) => setReview({ ...review, title: e.target.value })}
                placeholder="Sum up your experience..."
                maxLength="100"
                className="form-input"
              />
              <small className="char-count">{review.title.length}/100</small>
            </div>

            <div className="form-section">
              <label htmlFor="comment" className="form-label">Your Review *</label>
              <textarea
                id="comment"
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Share your detailed experience. What did you like or dislike?"
                rows="6"
                maxLength="1000"
                className="form-textarea"
              />
              <small className="char-count">{review.comment.length}/1000</small>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn-submit"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/customer/bookings')}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewBooking;
