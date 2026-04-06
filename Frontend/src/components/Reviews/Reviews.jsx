import { useState, useEffect } from 'react'
import { reviewAPI, bookingAPI } from '../../services/api'
import './Reviews.css'

const Reviews = ({ equipmentId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [userCompletedBookings, setUserCompletedBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  // Fetch reviews for equipment
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewAPI.getEquipmentReviews(equipmentId)
        
        // Handle backend response structure
        let reviewsData = []
        
        // Backend returns { count, rows } from findAndCountAll()
        if (response?.data?.data?.rows && Array.isArray(response.data.data.rows)) {
          reviewsData = response.data.data.rows
        } else if (response?.data?.rows && Array.isArray(response.data.rows)) {
          reviewsData = response.data.rows
        } else if (Array.isArray(response?.data?.data)) {
          reviewsData = response.data.data
        } else if (Array.isArray(response?.data)) {
          reviewsData = response.data
        }
        
        // Map backend fields to component fields
        const mappedReviews = reviewsData.map(review => ({
          id: review.id,
          customerId: review.customerId,
          user: review.customerName || `Customer #${review.customerId}`,
          rating: Number(review.rating),
          comment: review.comment || '',
          date: review.createdAt || new Date().toISOString(),
          helpful: 0
        }))
        
        setReviews(mappedReviews)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    if (equipmentId) {
      fetchReviews()
    }
  }, [equipmentId])

  // Fetch user's completed bookings for this equipment
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await bookingAPI.getMyBookings({ equipmentId })
        
        let bookings = []
        if (response?.data?.data?.bookings && Array.isArray(response.data.data.bookings)) {
          bookings = response.data.data.bookings
        } else if (response?.data?.bookings && Array.isArray(response.data.bookings)) {
          bookings = response.data.bookings
        } else if (Array.isArray(response?.data?.data)) {
          bookings = response.data.data
        } else if (Array.isArray(response?.data)) {
          bookings = response.data
        }
        
        // Filter only completed bookings
        const completedBookings = bookings.filter(
          b => b.status === 'COMPLETED' && b.equipmentId === Number(equipmentId)
        )
        
        setUserCompletedBookings(completedBookings)
        if (completedBookings.length > 0) {
          setSelectedBookingId(completedBookings[0].id)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setUserCompletedBookings([])
      }
    }

    if (equipmentId) {
      fetchUserBookings()
    }
  }, [equipmentId])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!selectedBookingId) {
      alert('Please select a completed booking to review')
      return
    }

    setSubmitting(true)

    try {
      const response = await reviewAPI.createReview(selectedBookingId, newReview)
      
      // Map response to component format
      const newReviewObj = {
        id: response?.data?.data?.id || Date.now(),
        customerId: response?.data?.data?.customerId,
        user: `Customer #${response?.data?.data?.customerId}`,
        rating: Number(response?.data?.data?.rating || newReview.rating),
        comment: response?.data?.data?.comment || newReview.comment,
        date: response?.data?.data?.createdAt || new Date().toISOString(),
        helpful: 0
      }
      
      setReviews([newReviewObj, ...reviews])
      setNewReview({ rating: 5, comment: '' })
      setShowReviewForm(false)
      alert('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      const errorMsg = error.response?.data?.message || 'Failed to submit review. Please try again.'
      alert(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onChange && onChange(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>
  }

  const canWriteReview = userCompletedBookings.length > 0

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        {canWriteReview && (
          <button
            className="write-review-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="average-rating">
          <div className="rating-number">{averageRating.toFixed(1)}</div>
          {renderStars(Math.round(averageRating))}
          <div className="total-reviews">({reviews.length} reviews)</div>
        </div>

        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="rating-bar">
                <span className="star-label">{star} ★</span>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <h4>Write Your Review</h4>

          {canWriteReview ? (
            <>
              <div className="form-group">
                <label htmlFor="booking-select">Select Booking</label>
                <select
                  id="booking-select"
                  value={selectedBookingId || ''}
                  onChange={(e) => setSelectedBookingId(Number(e.target.value))}
                  className="form-select"
                  required
                >
                  <option value="">-- Select a completed booking --</option>
                  {userCompletedBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      Booking #{booking.id} - {new Date(booking.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rating</label>
                {renderStars(newReview.rating, true, (rating) =>
                  setNewReview({ ...newReview, rating })
                )}
              </div>

              <div className="form-group">
                <label htmlFor="review-comment">Comment</label>
                <textarea
                  id="review-comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this equipment..."
                  rows="4"
                  className="form-textarea"
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="submit-btn">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-booking-message">
              <p>✓ You need to complete a booking for this equipment before you can write a review.</p>
              <p>After your booking is completed, come back here to share your feedback!</p>
            </div>
          )}
        </form>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this equipment!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-name">{review.user}</div>
                  <div className="review-date">{new Date(review.date).toLocaleDateString()}</div>
                </div>
                {renderStars(review.rating)}
              </div>

              <div className="review-content">
                <p>{review.comment}</p>
              </div>

              <div className="review-footer">
                <button className="helpful-btn">
                  <i className="fas fa-thumbs-up"></i>
                  Helpful ({review.helpful || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews