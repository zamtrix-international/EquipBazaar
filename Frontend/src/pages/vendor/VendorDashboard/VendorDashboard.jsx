// pages/vendor/VendorDashboard/VendorDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI, bookingAPI, payoutAPI, deliveryAPI } from '../../../services/api';
import './VendorDashboard.css';

// Icon Components
const Icons = {
  Tools: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  ),
  CalendarCheck: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
    </svg>
  ),
  Rupee: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h12M6 8h12M14 18l4 3M6 13h8a4 4 0 0 0 0-8H6"></path>
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  PlusCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
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
  CalendarAlt: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <circle cx="12" cy="15" r="1"></circle>
      <circle cx="16" cy="15" r="1"></circle>
      <circle cx="8" cy="15" r="1"></circle>
    </svg>
  ),
  ChartLine: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"></path>
      <polyline points="3 6 8 11 12 7 18 13 21 10"></polyline>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  )
};

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeBookings: 0,
    totalEarnings: 0,
    pendingApprovals: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingBooking, setProcessingBooking] = useState(null);

  // Handle booking actions (accept/reject)
  const handleBookingAction = useCallback(async (bookingId, action) => {
    setProcessingBooking(bookingId);
    setError('');

    try {
      const statusMap = {
        accept: 'ACCEPTED',
        reject: 'REJECTED'
      };
      
      const newStatus = statusMap[action];
      const response = await bookingAPI.updateStatus(bookingId, newStatus);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || `Failed to ${action} booking`);
      }

      // Update local state
      setRecentBookings(prev => 
        prev.map(b => 
          b.id === bookingId 
            ? { ...b, status: newStatus }
            : b
        )
      );

      // Update stats
      if (action === 'accept') {
        setStats(prev => ({
          ...prev,
          activeBookings: prev.activeBookings + 1,
          pendingApprovals: prev.pendingApprovals - 1
        }));
      } else {
        setStats(prev => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1
        }));
      }
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err);
      alert(err.message || `Failed to ${action} booking. Please try again.`);
    } finally {
      setProcessingBooking(null);
    }
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [equipmentRes, bookingsRes, payoutsRes] = await Promise.all([
        equipmentAPI.getMyEquipment({ page: 1, limit: 100 }),
        bookingAPI.getVendorBookings({ page: 1, limit: 10 }),
        payoutAPI.getPayouts({ page: 1, limit: 100 })
      ]);

      const equipmentCount = equipmentRes?.data?.data?.count || 0;
      const vendorBookings =
        bookingsRes?.data?.data?.rows ||
        bookingsRes?.data?.data?.bookings ||
        [];

      const totalEarnings =
        vendorBookings.reduce((sum, booking) => sum + (booking.vendorNetAmount || 0), 0) ||
        payoutsRes?.data?.data?.rows?.reduce((sum, payout) => sum + (payout.amount || 0), 0) ||
        0;

      const activeBookings = vendorBookings.filter((b) =>
        ['PAID', 'ACCEPTED', 'ON_THE_WAY', 'WORK_STARTED', 'DELIVERED'].includes(String(b.status || '').toUpperCase())
      ).length;

      const pendingApprovals = vendorBookings.filter((b) =>
        ['PAID'].includes(String(b.status || '').toUpperCase())
      ).length;

      setStats({
        totalEquipment: equipmentCount,
        activeBookings,
        totalEarnings,
        pendingApprovals
      });

      setRecentBookings(vendorBookings.slice(0, 5));
    } catch (err) {
      console.error('Error fetching vendor dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      setStats({
        totalEquipment: 0,
        activeBookings: 0,
        totalEarnings: 0,
        pendingApprovals: 0
      });
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get status class
  const getStatusClass = (status) => {
    const statusMap = {
      'requested': 'status-pending',
      'paid': 'status-pending',
      'accepted': 'status-confirmed',
      'on_the_way': 'status-confirmed',
      'work_started': 'status-confirmed',
      'delivered': 'status-confirmed',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'rejected': 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  // Loading state
  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Vendor Dashboard</h1>
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <p>{error}</p>
              <button onClick={fetchDashboardData} className="retry-btn">
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-total">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.Tools />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Equipment</span>
              <span className="stat-value">{stats.totalEquipment}</span>
            </div>
          </div>

          <div className="stat-card stat-card-active">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.CalendarCheck />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Active Bookings</span>
              <span className="stat-value">{stats.activeBookings}</span>
            </div>
          </div>

          <div className="stat-card stat-card-earnings">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.Rupee />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Earnings</span>
              <span className="stat-value">{formatCurrency(stats.totalEarnings)}</span>
            </div>
          </div>

          <div className="stat-card stat-card-pending">
            <div className="stat-icon-wrapper">
              <div className="stat-icon">
                <Icons.Clock />
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-label">Pending Approvals</span>
              <span className="stat-value">{stats.pendingApprovals}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/vendor/add-equipment" className="action-card action-card-add">
              <div className="action-icon-wrapper">
                <Icons.PlusCircle />
              </div>
              <div className="action-content">
                <h3>Add Equipment</h3>
                <p>List new equipment for rent</p>
                <span className="action-link">Add Now →</span>
              </div>
            </Link>

            <Link to="/vendor/my-equipment" className="action-card action-card-list">
              <div className="action-icon-wrapper">
                <Icons.List />
              </div>
              <div className="action-content">
                <h3>My Equipment</h3>
                <p>Manage your equipment</p>
                <span className="action-link">View All →</span>
              </div>
            </Link>

            <Link to="/vendor/bookings" className="action-card action-card-bookings">
              <div className="action-icon-wrapper">
                <Icons.CalendarAlt />
              </div>
              <div className="action-content">
                <h3>Manage Bookings</h3>
                <p>Accept or reject bookings</p>
                <span className="action-link">Manage →</span>
              </div>
            </Link>

            <Link to="/vendor/earnings" className="action-card action-card-earnings">
              <div className="action-icon-wrapper">
                <Icons.ChartLine />
              </div>
              <div className="action-content">
                <h3>Earnings</h3>
                <p>View your earnings</p>
                <span className="action-link">View →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="recent-bookings">
          <div className="section-header">
            <h2>Recent Booking Requests</h2>
            <Link to="/vendor/bookings" className="view-all-link">
              View All Bookings
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No bookings yet</h3>
              <p>When customers book your equipment, they'll appear here</p>
            </div>
          ) : (
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>
                        <div className="equipment-info">
                          <span className="equipment-name">{booking.equipment?.name || booking.equipment}</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{booking.customer?.name || booking.customer}</span>
                        </div>
                      </td>
                      <td>
                        <span className="booking-date">{formatDate(booking.startDate || booking.date)}</span>
                      </td>
                      <td>
                        <span className="booking-amount">{formatCurrency(booking.totalAmount || booking.amount)}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {String(booking.status || '').toUpperCase() === 'PAID' && (
                          <div className="action-buttons">
                            <button
                              className="btn-accept"
                              onClick={() => handleBookingAction(booking.id, 'accept')}
                              disabled={processingBooking === booking.id}
                              title="Accept Booking"
                            >
                              {processingBooking === booking.id ? (
                                <span className="spinner-small"></span>
                              ) : (
                                <Icons.Check />
                              )}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                              disabled={processingBooking === booking.id}
                              title="Reject Booking"
                            >
                              {processingBooking === booking.id ? (
                                <span className="spinner-small"></span>
                              ) : (
                                <Icons.X />
                              )}
                            </button>
                          </div>
                        )}
                        {booking.status !== 'pending' && (
                          <Link to={`/vendor/bookings/${booking.id}`} className="view-link">
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VendorDashboard;