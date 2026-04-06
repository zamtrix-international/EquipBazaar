// pages/admin/AdminDashboard/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, payoutAPI } from '../../../services/api';
import './AdminDashboard.css';

// Icon Components
const Icons = {
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Truck: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
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
  UserCheck: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <polyline points="17 11 19 13 23 9"></polyline>
    </svg>
  ),
  UsersCog: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <circle cx="20" cy="8" r="2.5"></circle>
      <path d="M22 12V8a5 5 0 0 0-5-5h-5"></path>
    </svg>
  ),
  Percent: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="5" x2="5" y2="19"></line>
      <circle cx="6.5" cy="6.5" r="2.5"></circle>
      <circle cx="17.5" cy="17.5" r="2.5"></circle>
    </svg>
  ),
  ChartBar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    pendingPayouts: 0
  });

  const [recentVendors, setRecentVendors] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Handle vendor approval/rejection
  const handleVendorAction = async (vendorId, newStatus) => {
    setProcessingId(vendorId);
    setError('');

    try {
      const response = await adminAPI.updateVendorStatus(vendorId, newStatus);

      if (response?.data?.success) {
        setRecentVendors(prev => 
          prev.map(v => v.id === vendorId ? { ...v, status: newStatus } : v)
        );
        if (newStatus === 'approved' || newStatus === 'suspended') {
          setStats(prev => ({
            ...prev,
            pendingVendors: Math.max(0, prev.pendingVendors - 1)
          }));
        }
      } else {
        setError(response?.data?.message || 'Vendor status update is not supported by the current backend.');
      }
    } catch (err) {
      console.warn('Vendor status endpoint not available:', err.message || err);
      setError(err.response?.data?.message || err.message || 'Vendor status update is not supported by the current backend.');
    } finally {
      setProcessingId(null);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboardRes, vendorsRes, bookingsRes, payoutRequestsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers({ limit: 5, sort: '-createdAt' }),
        adminAPI.getBookings({ limit: 5, sort: '-createdAt' }),
        payoutAPI.getWithdrawalRequests().catch(() => ({
          data: { success: true, data: { requests: [], rows: [] } }
        }))
      ]);

      const payoutRequests =
        payoutRequestsRes?.data?.data?.requests ||
        payoutRequestsRes?.data?.data?.rows ||
        payoutRequestsRes?.data?.requests ||
        [];

      const pendingPayouts = Array.isArray(payoutRequests)
        ? payoutRequests.filter((request) => String(request.status || '').toUpperCase() === 'PENDING').length
        : 0;

      if (dashboardRes?.data?.success) {
        setStats({
          totalUsers: 0,
          totalVendors: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingVendors: 0,
          pendingPayouts,
          ...(dashboardRes.data.data || {})
        });
      } else if (dashboardRes?.data) {
        setStats({
          totalUsers: 0,
          totalVendors: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingVendors: 0,
          pendingPayouts,
          ...dashboardRes.data
        });
      } else {
        throw new Error(dashboardRes?.data?.message || 'Failed to fetch dashboard data');
      }

      let vendorList = [];
      if (vendorsRes?.data?.success) {
        const raw = vendorsRes.data.data?.vendors || vendorsRes.data.data?.rows || [];
        vendorList = Array.isArray(raw) ? raw : [];
      } else if (Array.isArray(vendorsRes?.data)) {
        vendorList = vendorsRes.data;
      } else if (vendorsRes?.data?.vendors) {
        vendorList = vendorsRes.data.vendors;
      }
      setRecentVendors(vendorList.filter((v) => v.role === 'VENDOR' || v.role === 'vendor'));

      const bookingList =
        bookingsRes?.data?.data?.bookings ||
        bookingsRes?.data?.data?.rows ||
        bookingsRes?.data?.bookings ||
        [];
      setRecentBookings(Array.isArray(bookingList) ? bookingList : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      
      setStats({
        totalUsers: 0,
        totalVendors: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingVendors: 0,
        pendingPayouts: 0
      });
      setRecentVendors([]);
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'suspended': 'status-suspended',
      'completed': 'status-completed',
      'confirmed': 'status-confirmed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your platform today.</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users-icon">
              <Icons.Users />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-trend positive">+12% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon vendors-icon">
              <Icons.Truck />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Vendors</span>
              <span className="stat-value">{stats.totalVendors}</span>
              <span className="stat-trend positive">+5% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bookings-icon">
              <Icons.CalendarCheck />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Bookings</span>
              <span className="stat-value">{stats.totalBookings}</span>
              <span className="stat-trend positive">+23% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue-icon">
              <Icons.Rupee />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
              <span className="stat-trend positive">+18% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">
              <Icons.Clock />
            </div>
            <div className="stat-info">
              <span className="stat-label">Pending Vendors</span>
              <span className="stat-value">{stats.pendingVendors}</span>
              <span className="stat-trend warning">Awaiting approval</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/vendors" className="action-card">
              <div className="action-icon">
                <Icons.UserCheck />
              </div>
              <div className="action-info">
                <h3>Verify Vendors</h3>
                <p>{stats.pendingVendors} pending {stats.pendingVendors === 1 ? 'approval' : 'approvals'}</p>
              </div>
            </Link>

            <Link to="/admin/users" className="action-card">
              <div className="action-icon">
                <Icons.UsersCog />
              </div>
              <div className="action-info">
                <h3>Manage Users</h3>
                <p>View all customers</p>
              </div>
            </Link>

            <Link to="/admin/payouts" className="action-card">
              <div className="action-icon">
                <Icons.Rupee />
              </div>
              <div className="action-info">
                <h3>Review Payouts</h3>
                <p>{stats.pendingPayouts || 0} pending payout {stats.pendingPayouts === 1 ? 'request' : 'requests'}</p>
              </div>
            </Link>

            <Link to="/admin/commission" className="action-card">
              <div className="action-icon">
                <Icons.Percent />
              </div>
              <div className="action-info">
                <h3>Set Commission</h3>
                <p>Update commission rates</p>
              </div>
            </Link>

            <Link to="/admin/reports" className="action-card">
              <div className="action-icon">
                <Icons.ChartBar />
              </div>
              <div className="action-info">
                <h3>View Reports</h3>
                <p>Analytics & insights</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Vendors */}
        <div className="recent-section">
          <div className="section-header">
            <h2>Pending Vendor Approvals</h2>
            <Link to="/admin/vendors" className="view-all">View All →</Link>
          </div>

          {recentVendors.length === 0 ? (
            <div className="empty-state">
              <p>No pending vendor approvals</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Email</th>
                    <th>Equipment</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVendors.map(vendor => (
                    <tr key={vendor.id}>
                      <td className="vendor-name-cell">{vendor.name}</td>
                      <td>{vendor.email}</td>
                      <td>{vendor.equipment || '-'}</td>
                      <td>{formatDate(vendor.joinedDate)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td>
                        {vendor.status === 'pending' && (
                          <div className="action-buttons">
                            <button 
                              className="btn-approve"
                              onClick={() => handleVendorAction(vendor.id, 'approved')}
                              disabled={processingId === vendor.id}
                            >
                              {processingId === vendor.id ? (
                                <span className="spinner-small"></span>
                              ) : (
                                <>Approve</>
                              )}
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleVendorAction(vendor.id, 'suspended')}
                              disabled={processingId === vendor.id}
                            >
                              {processingId === vendor.id ? (
                                <span className="spinner-small"></span>
                              ) : (
                                <>Reject</>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/admin/bookings" className="view-all">View All →</Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <p>No recent bookings</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Customer</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.equipment}</td>
                      <td>{booking.customer}</td>
                      <td>{booking.vendor}</td>
                      <td className="amount-cell">{formatCurrency(booking.amount)}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;