// pages/customer/CustomerDashboard/CustomerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI, bookingAPI } from '../../../services/api';
import './CustomerDashboard.css';

// Icon components (Construction Theme Colors)
const Icons = {
  CalendarCheck: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
    </svg>
  ),
  
  Spinner: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 6v2M12 16v2M6 12h2M16 12h2"></path>
    </svg>
  ),
  
  CheckCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  
  Rupee: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h12M6 8h12M14 18l4 3M6 13h8a4 4 0 0 0 0-8H6"></path>
    </svg>
  ),
  
  Search: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  
  List: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
  
  Loader: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  )
};

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboardRes, bookingsRes] = await Promise.all([
        customerAPI.getDashboard(),
        bookingAPI.getMyBookings({ limit: 5, sort: '-createdAt' })
      ]);

      if (dashboardRes?.data?.success) {
        setStats(dashboardRes.data.data.stats || {
          totalBookings: 0,
          activeBookings: 0,
          completedBookings: 0,
          totalSpent: 0
        });
      }

      if (bookingsRes?.data?.success) {
        setRecentBookings(bookingsRes.data.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching customer dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      setStats({
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalSpent: 0
      });
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'active': 'status-active'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="customer-dashboard">
        <div className="container">
          <div className="loading-state">
            <Icons.Loader />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Customer Dashboard</h1>
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <p>{error}</p>
              <button 
                onClick={fetchDashboardData} 
                className="retry-btn"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards - Proper Distribution */}
        <div className="stats-grid">
          <div className="stat-card stat-card-total">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.CalendarCheck />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Bookings</span>
              <span className="stat-value">{stats.totalBookings}</span>
            </div>
          </div>

          <div className="stat-card stat-card-active">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.Spinner />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Active Bookings</span>
              <span className="stat-value">{stats.activeBookings}</span>
            </div>
          </div>

          <div className="stat-card stat-card-completed">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.CheckCircle />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{stats.completedBookings}</span>
            </div>
          </div>

          <div className="stat-card stat-card-spent">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.Rupee />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">{formatCurrency(stats.totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/equipment" className="action-card action-card-browse">
              <div className="action-icon-wrapper">
                <Icons.Search />
              </div>
              <div className="action-content">
                <h3>Browse Equipment</h3>
                <p>Find equipment for your project</p>
                <span className="action-link">
                  Browse Now →
                </span>
              </div>
            </Link>

            <Link to="/customer/bookings" className="action-card action-card-bookings">
              <div className="action-icon-wrapper">
                <Icons.List />
              </div>
              <div className="action-content">
                <h3>My Bookings</h3>
                <p>View and manage all your bookings</p>
                <span className="action-link">
                  View All →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="recent-bookings">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            {recentBookings.length > 0 && (
              <Link to="/customer/bookings" className="view-all-link">
                View All Bookings
              </Link>
            )}
          </div>

          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No bookings yet</h3>
              <p>Browse equipment and make your first booking</p>
              <Link to="/equipment" className="btn btn-primary">
                Browse Equipment
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {recentBookings.map((booking) => (
                <Link 
                  key={booking.id} 
                  to={`/customer/bookings/${booking.id}`}
                  className="booking-item"
                >
                  <div className="booking-info">
                    <h3>{booking.equipment?.name || 'Equipment'}</h3>
                    <div className="booking-meta">
                      <span className="booking-date">
                        📅 {formatDate(booking.startDate)}
                      </span>
                      {booking.duration && (
                        <span className="booking-duration">
                          ⏱️ {booking.duration} {booking.durationUnit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="booking-status">
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="booking-amount">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;