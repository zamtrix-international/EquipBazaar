// pages/Module/EquipmentDetail/EquipmentDetail.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentAPI } from '../../../services/api';
import EquipmentCalendar from '../../../components/EquipmentCalendar/EquipmentCalendar';
import Reviews from '../../../components/Reviews/Reviews';
import './EquipmentDetail.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const EQUIPMENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Crect x='180' y='90' width='240' height='160' rx='16' fill='%23d1d5db'/%3E%3Ccircle cx='255' cy='155' r='24' fill='%239ca3af'/%3E%3Cpath d='M200 230l60-50 45 35 45-55 50 70' fill='none' stroke='%236b7280' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='300' y='315' text-anchor='middle' font-family='Arial' font-size='28' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";

const resolveImageUrl = (image) => {
  const rawImage = image?.url || image?.imageUrl || image || '';

  if (!rawImage) return EQUIPMENT_PLACEHOLDER;
  if (/^https?:\/\//i.test(rawImage) || String(rawImage).startsWith('data:')) return rawImage;

  const normalizedPath = String(rawImage).replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(normalizedPath)) return EQUIPMENT_PLACEHOLDER;

  return normalizedPath.startsWith('/')
    ? `${API_BASE_URL}${normalizedPath}`
    : `${API_BASE_URL}/${normalizedPath}`;
};

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('hourly');
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingHours, setBookingHours] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch equipment details
  const fetchEquipmentDetail = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await equipmentAPI.getById(id);
      
      if (response?.data?.success) {
        const equipmentData = response.data.data || {};
        const normalizedEquipment = {
          ...equipmentData,
          name: equipmentData.name || equipmentData.title || 'Equipment',
          category: equipmentData.category || equipmentData.type || 'Equipment',
          rating: Number(equipmentData.ratingAvg ?? equipmentData.rating ?? 0),
          reviews: Number(equipmentData.ratingCount ?? equipmentData.reviews ?? 0),
          rates: equipmentData.rates || {
            hourly: Number(equipmentData.hourlyRate || 0),
            daily: Number(equipmentData.dailyRate || 0),
            weekly: Number(equipmentData.weeklyRate || (Number(equipmentData.dailyRate || 0) * 7)),
          },
          images: Array.isArray(equipmentData.images) ? equipmentData.images : [],
          vendor: equipmentData.vendor
            ? {
                ...equipmentData.vendor,
                name: equipmentData.vendor.businessName || equipmentData.vendor.ownerName || equipmentData.vendor.name || 'Vendor',
                rating: Number(equipmentData.vendor.ratingAvg ?? equipmentData.vendor.rating ?? 0),
                location: equipmentData.vendor.address || equipmentData.vendor.city || equipmentData.vendor.location || 'Meerut',
                memberSince: equipmentData.vendor.createdAt
                  ? new Date(equipmentData.vendor.createdAt).getFullYear()
                  : equipmentData.vendor.memberSince || '',
              }
            : null,
        };

        setEquipment(normalizedEquipment);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch equipment details');
      }
    } catch (err) {
      console.error('Error fetching equipment detail:', err);
      setError(err.message || 'Failed to load equipment details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchEquipmentDetail();
  }, [fetchEquipmentDetail]);

  // ✅ हा बदललेला useEffect - 404 एरर साठी फिक्स
  useEffect(() => {
    const checkAvailability = async () => {
      if (!bookingDate || !id) return;

      setCheckingAvailability(true);
      
      // तात्पुरता फिक्स - API काम करेपर्यंत नेहमी available दाखव
      setTimeout(() => {
        setAvailability({ 
          available: true, 
          message: 'Available for booking' 
        });
        setCheckingAvailability(false);
      }, 500);
      
      // खालचा कोड तात्पुरता कॉमेंट केला
      /*
      try {
        const response = await equipmentAPI.getAvailability(id, {
          date: bookingDate.toISOString().split('T')[0],
          duration: selectedDuration,
          hours: selectedDuration === 'hourly' ? bookingHours : null
        });

        if (response?.data?.success || response?.data?.available !== undefined) {
          setAvailability(response.data);
        }
      } catch (err) {
        console.error('Availability check error:', err);
        setAvailability({ available: false, message: 'Unable to check availability' });
      } finally {
        setCheckingAvailability(false);
      }
      */
    };

    checkAvailability();
  }, [id, bookingDate, selectedDuration, bookingHours]); // ✅ हे डिपेंडन्सीज तसेच राहतील

  // Calculate total price
  const calculateTotal = useCallback(() => {
    if (!equipment) return 0;

    const rates = equipment.rates || {};
    
    switch (selectedDuration) {
      case 'hourly':
        return (rates.hourly || 0) * bookingHours;
      case 'daily':
        return rates.daily || 0;
      case 'weekly':
        return rates.weekly || 0;
      default:
        return 0;
    }
  }, [equipment, selectedDuration, bookingHours]);

  // Memoized total
  const totalPrice = useMemo(() => calculateTotal(), [calculateTotal]);

  // Handle date selection
  const handleDateSelect = useCallback((date) => {
    setBookingDate(date);
    setAvailability(null);
  }, []);

  // Handle booking
  const handleBooking = useCallback(async () => {
    if (!bookingDate) {
      alert('Please select a booking date');
      return;
    }

    if (availability && !availability.available) {
      alert(availability.message || 'Equipment not available on selected date');
      return;
    }

    try {
      navigate(`/customer/payment/${id}`, {
        state: {
          equipment: {
            id: equipment.id,
            name: equipment.name,
            category: equipment.category,
            rates: equipment.rates,
            vendor: equipment.vendor
          },
          bookingDetails: {
            duration: selectedDuration,
            date: bookingDate.toISOString().split('T')[0],
            hours: selectedDuration === 'hourly' ? bookingHours : null,
            total: totalPrice
          }
        }
      });
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to proceed to booking. Please try again.');
    }
  }, [id, equipment, bookingDate, selectedDuration, bookingHours, totalPrice, availability, navigate]);

  // Handle contact vendor
  const handleContactVendor = useCallback(() => {
    if (equipment?.vendor?.phone) {
      window.location.href = `tel:${equipment.vendor.phone}`;
    }
  }, [equipment]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="equipment-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading equipment details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="equipment-detail-page">
        <div className="container">
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                onClick={() => navigate(-1)} 
                className="btn btn-secondary"
              >
                Go Back
              </button>
              <button 
                onClick={fetchEquipmentDetail} 
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!equipment) {
    return (
      <div className="equipment-detail-page">
        <div className="container">
          <div className="not-found-state">
            <span className="not-found-icon">🔍</span>
            <h2>Equipment Not Found</h2>
            <p>The equipment you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/equipment')} 
              className="btn btn-primary"
            >
              Browse Equipment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = equipment.isActive === true && (!availability || availability.available);
  const canBook = bookingDate && isAvailable && !checkingAvailability;

  return (
    <div className="equipment-detail-page">
      <div className="container">
        {/* Back Button */}
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Main Content */}
        <div className="detail-grid">
          {/* Left Column - Images & Info */}
          <div className="detail-left">
            {/* Main Image */}
            <div className="image-section">
              <div className="main-image">
                <img 
                  src={resolveImageUrl(equipment.images?.[0])} 
                  alt={equipment.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = EQUIPMENT_PLACEHOLDER;
                  }}
                />
                {!equipment.isActive && (
                  <span className="badge unavailable">Inactive</span>
                )}
                {equipment.featured && (
                  <span className="badge featured">Featured</span>
                )}
              </div>

              {/* Image Gallery */}
              {equipment.images?.length > 1 && (
                <div className="image-gallery">
                  {equipment.images.slice(1, 5).map((img, index) => (
                    <button
                      key={index}
                      className="gallery-item"
                      onClick={() => {/* Open lightbox */}}
                      aria-label={`View image ${index + 2}`}
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`${equipment.name} ${index + 2}`}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = EQUIPMENT_PLACEHOLDER;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="info-section">
              <h2>Description</h2>
              <p>{equipment.description || 'No description available.'}</p>
            </div>

            {/* Specifications */}
            {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
              <div className="info-section">
                <h2>Specifications</h2>
                <div className="specs-grid">
                  {Object.entries(equipment.specifications).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {equipment.features?.length > 0 && (
              <div className="info-section">
                <h2>Features</h2>
                <ul className="features-list">
                  {equipment.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="#ffc107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="detail-right">
            <div className="booking-card">
              {/* Header */}
              <div className="booking-header">
                <h1>{equipment.name}</h1>
                <p className="category">{equipment.category}</p>
              </div>

              {/* Rating */}
              {equipment.rating && (
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < Math.floor(equipment.rating) ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-value">{equipment.rating.toFixed(1)}</span>
                  <span className="review-count">
                    ({equipment.reviews || 0} {equipment.reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Pricing Tabs */}
              <div className="pricing-tabs">
                {['hourly', 'daily', 'weekly'].map((duration) => {
                  const rate = equipment.rates?.[duration];
                  return rate ? (
                    <button
                      key={duration}
                      className={`tab ${selectedDuration === duration ? 'active' : ''}`}
                      onClick={() => setSelectedDuration(duration)}
                    >
                      {duration.charAt(0).toUpperCase() + duration.slice(1)}
                    </button>
                  ) : null;
                })}
              </div>

              {/* Price Display */}
              <div className="price-display">
                <span className="price">{formatCurrency(totalPrice)}</span>
                <span className="duration">/{selectedDuration}</span>
              </div>

              {/* Booking Form */}
              <div className="booking-form">
                {/* Date Selection */}
                <div className="form-group">
                  <label>Select Date</label>
                  <div className="calendar-wrapper">
                    <EquipmentCalendar
                      equipmentId={id}
                      onDateSelect={handleDateSelect}
                      disabled={!equipment.isActive}
                    />
                  </div>
                  {bookingDate && (
                    <p className="selected-date">
                      📅 {bookingDate.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                {/* Hours Selection */}
                {selectedDuration === 'hourly' && (
                  <div className="form-group">
                    <label htmlFor="booking-hours">Number of Hours</label>
                    <input
                      type="number"
                      id="booking-hours"
                      min="1"
                      max={equipment.maxHoursPerDay || 24}
                      value={bookingHours}
                      onChange={(e) => setBookingHours(parseInt(e.target.value) || 1)}
                      disabled={!equipment.isActive}
                    />
                    <small>Max {equipment.maxHoursPerDay || 24} hours per day</small>
                  </div>
                )}

                {/* Availability Status */}
                {checkingAvailability && (
                  <div className="availability-checking">
                    <div className="spinner-small"></div>
                    <span>Checking availability...</span>
                  </div>
                )}

                {availability && !availability.available && (
                  <div className="availability-error">
                    ⚠️ {availability.message || 'Not available on selected date'}
                  </div>
                )}

                {/* Book Button */}
                <button
                  className={`book-now-btn ${!canBook ? 'disabled' : ''}`}
                  onClick={handleBooking}
                  disabled={!canBook}
                >
                  {!bookingDate
                    ? 'Select Date to Book'
                    : checkingAvailability
                    ? 'Checking...'
                    : !isAvailable
                    ? 'Not Available'
                    : 'Proceed to Book'}
                </button>
              </div>

              {/* Vendor Info */}
              {equipment.vendor && (
                <div className="vendor-info">
                  <h3>Vendor Information</h3>
                  <div className="vendor-details">
                    <p className="vendor-name">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="12" cy="7" r="4" stroke="#ffc107" strokeWidth="2"/>
                      </svg>
                      {equipment.vendor.name}
                    </p>
                    {equipment.vendor.rating && (
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" 
                            fill="#ffc107" stroke="#ffc107"/>
                        </svg>
                        {equipment.vendor.rating} Rating
                      </p>
                    )}
                    <p>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ffc107" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="#ffc107" strokeWidth="2"/>
                      </svg>
                      {equipment.vendor.location}
                    </p>
                    {equipment.vendor.memberSince && (
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#ffc107" strokeWidth="2"/>
                          <line x1="16" y1="2" x2="16" y2="6" stroke="#ffc107" strokeWidth="2"/>
                          <line x1="8" y1="2" x2="8" y2="6" stroke="#ffc107" strokeWidth="2"/>
                          <line x1="3" y1="10" x2="21" y2="10" stroke="#ffc107" strokeWidth="2"/>
                        </svg>
                        Member since {equipment.vendor.memberSince}
                      </p>
                    )}
                    {equipment.vendor.phone && (
                      <p className="vendor-phone">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" 
                            stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {equipment.vendor.phone}
                      </p>
                    )}
                  </div>
                  {equipment.vendor.phone && (
                    <button 
                      className="contact-btn"
                      onClick={handleContactVendor}
                    >
                      Contact Vendor
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {equipment && <Reviews equipmentId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;