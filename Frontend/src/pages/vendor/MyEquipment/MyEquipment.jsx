// pages/vendor/MyEquipment/MyEquipment.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI } from '../../../services/api';
import './MyEquipment.css';

// Icon Components (Font Awesome ऐवजी SVG वापरले)
const Icons = {
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  CalendarCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
    </svg>
  ),
  Power: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path>
      <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path>
      <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  ),
  Empty: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
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

const getEquipmentStatus = (item = {}) => {
  if (item.status) return String(item.status).toLowerCase();
  if (item.isApproved === false) return 'pending';
  return item.isActive === false ? 'maintenance' : 'available';
};

const resolveEquipmentImage = (item = {}) => {
  const rawImage =
    item.images?.[0]?.url ||
    item.images?.[0]?.imageUrl ||
    item.imageUrl ||
    item.image ||
    item.thumbnail ||
    getCachedEquipmentImage(item.id) ||
    '';

  if (!rawImage) {
    return EQUIPMENT_PLACEHOLDER;
  }

  if (/^https?:\/\//i.test(rawImage) || rawImage.startsWith('data:')) {
    return rawImage;
  }

  const normalizedImage = String(rawImage).replace(/\\/g, '/');

  if (/^[a-zA-Z]:\//.test(normalizedImage)) {
    return getCachedEquipmentImage(item.id) || EQUIPMENT_PLACEHOLDER;
  }

  return normalizedImage.startsWith('/')
    ? `${API_BASE_URL}${normalizedImage}`
    : `${API_BASE_URL}/${normalizedImage}`;
};

const MyEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');

  // Fetch equipment from API
  const fetchMyEquipment = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await equipmentAPI.getMyEquipment();

      let equipmentList = [];

      if (response?.data?.success) {
        const vendorData = response.data.data || {};
        if (Array.isArray(vendorData.rows)) {
          equipmentList = vendorData.rows;
        } else if (Array.isArray(vendorData.equipment)) {
          equipmentList = vendorData.equipment;
        }
      } else if (Array.isArray(response?.data?.equipment)) {
        equipmentList = response.data.equipment;
      } else if (Array.isArray(response?.data)) {
        equipmentList = response.data;
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch equipment');
      }

      const enrichedEquipment = await Promise.all(
        equipmentList.map(async (item) => {
          try {
            const detailResponse = await equipmentAPI.getById(item.id);
            const detailData = detailResponse?.data?.data || {};

            return {
              ...item,
              ...detailData,
              images: Array.isArray(detailData.images) ? detailData.images : item.images || [],
            };
          } catch {
            return item;
          }
        })
      );

      setEquipment(enrichedEquipment);
    } catch (err) {
      console.error('Error fetching my equipment:', err);
      setError(err.message || 'Failed to load equipment. Please try again.');
      setEquipment([]); // Empty array on error - NO MOCK DATA
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEquipment();
  }, [fetchMyEquipment]);

  // Toggle equipment status
  const toggleStatus = async (id) => {
    const item = equipment.find((equipmentItem) => equipmentItem.id === id);
    if (!item) return;

    const newIsActive = !(item.isActive ?? getEquipmentStatus(item) === 'available');

    setUpdatingId(id);
    setError('');

    try {
      const response = await equipmentAPI.updateStatus(id, { isActive: newIsActive });

      if (response?.data?.success) {
        setEquipment((prev) =>
          prev.map((equipmentItem) =>
            equipmentItem.id === id
              ? {
                  ...equipmentItem,
                  isActive: newIsActive,
                  status: newIsActive ? 'available' : 'maintenance',
                }
              : equipmentItem
          )
        );
      } else {
        throw new Error(response?.data?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating equipment status:', err);
      setError(`Failed to update status: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter equipment by status
  const filteredEquipment = filter === 'all'
    ? equipment
    : equipment.filter((item) => getEquipmentStatus(item) === filter);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status class
  const getStatusClass = (status) => {
    const statusMap = {
      'available': 'status-available',
      'booked': 'status-booked',
      'maintenance': 'status-maintenance',
      'pending': 'status-pending'
    };
    return statusMap[String(status || '').toLowerCase()] || 'status-available';
  };

  // Get status text
  const getStatusText = (status) => {
    const statusMap = {
      'available': 'Available',
      'booked': 'Booked',
      'maintenance': 'Maintenance',
      'pending': 'Pending'
    };
    return statusMap[status] || status;
  };

  // Loading state
  if (loading) {
    return (
      <div className="my-equipment-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading your equipment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-equipment-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">My Equipment</h1>
          <Link to="/vendor/add-equipment" className="add-btn">
            <Icons.Plus />
            <span>Add New Equipment</span>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchMyEquipment} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['all', 'available', 'booked', 'maintenance', 'pending'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All' : getStatusText(status)}
              {status !== 'all' && (
                <span className="filter-count">
                  {equipment.filter((item) => getEquipmentStatus(item) === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length === 0 ? (
          <div className="empty-state">
            <Icons.Empty />
            <h3>No equipment found</h3>
            <p>
              {filter !== 'all' 
                ? `You don't have any ${filter} equipment` 
                : "You haven't added any equipment yet"}
            </p>
            <Link to="/vendor/add-equipment" className="empty-add-btn">
              <Icons.Plus />
              <span>Add Your First Equipment</span>
            </Link>
          </div>
        ) : (
          <div className="equipment-grid">
            {filteredEquipment.map((item) => {
              const itemStatus = getEquipmentStatus(item);
              const itemName = item.name || item.title || 'Untitled Equipment';
              const itemCategory = item.category || item.type || 'Uncategorized';
              const ratingValue = Number(item.ratingAvg ?? item.rating ?? 0);
              const bookingCount = Number(item.bookingCount ?? item.bookings ?? 0);

              return (
              <div key={item.id} className="equipment-card">
                {/* Image Section */}
                <div className="equipment-image">
                  <img
                    src={resolveEquipmentImage(item)}
                    alt={itemName}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = getCachedEquipmentImage(item.id) || EQUIPMENT_PLACEHOLDER;
                    }}
                  />
                  <span className={`status-badge ${getStatusClass(itemStatus)}`}>
                    {getStatusText(itemStatus)}
                  </span>

                  {/* Rating Badge */}
                  {ratingValue > 0 && (
                    <span className="rating-badge">
                      <Icons.Star />
                      {ratingValue.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Info Section */}
                <div className="equipment-info">
                  <h3 title={itemName}>{itemName}</h3>
                  <p className="category">{itemCategory}</p>

                  {/* Pricing */}
                  <div className="pricing">
                    <span className="hourly">
                      {formatCurrency(Number(item.hourlyRate || 0))}<span>/hr</span>
                    </span>
                    <span className="daily">
                      {formatCurrency(Number(item.dailyRate || item.hourlyRate || 0))}<span>/day</span>
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="stats">
                    <span>
                      <Icons.Star />
                      {ratingValue.toFixed(1)}
                    </span>
                    <span>
                      <Icons.CalendarCheck />
                      {bookingCount} bookings
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="actions">
                    <Link 
                      to={`/vendor/edit-equipment/${item.id}`} 
                      className="btn-edit"
                    >
                      <Icons.Edit />
                      <span>Edit</span>
                    </Link>
                    
                    <button 
                      className={`btn-status ${itemStatus}`}
                      onClick={() => toggleStatus(item.id)}
                      disabled={updatingId === item.id}
                    >
                      {updatingId === item.id ? (
                        <span className="spinner-small"></span>
                      ) : (
                        <>
                          <Icons.Power />
                          <span>
                            {itemStatus === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEquipment;