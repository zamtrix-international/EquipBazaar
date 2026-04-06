// pages/admin/ManageUsers/ManageUsers.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../services/api';
import './ManageUsers.css';

// Icon Components
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Users: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  )
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filter !== 'all') params.role = filter;
      if (searchTerm) params.search = searchTerm;

      const response = await adminAPI.getUsers(params);

      if (response?.data?.success) {
        setUsers(response.data.data.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total || 0,
          pages: response.data.data.pages || 0
        }));
      } else if (response?.data?.users) {
        setUsers(response.data.users);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          pages: response.data.pages || 0
        }));
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers]);

  // Handle manual search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  // Toggle user status (active/blocked)
  const toggleUserStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === 'active' ? 'blocked' : 'active';
    
    setProcessingId(userId);
    setError('');

    try {
      const response = await adminAPI.updateUserStatus(userId, { status: newStatus });

      if (response?.data?.success) {
        setUsers(prev => 
          prev.map(u => 
            u.id === userId 
              ? { ...u, status: newStatus }
              : u
          )
        );
      } else {
        setError(response?.data?.message || 'User status update is not supported by the current backend.');
      }
    } catch (err) {
      console.warn('User status endpoint not available:', err.message || err);
      setError(err.response?.data?.message || err.message || 'User status update is not supported by the current backend.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle view user details
  const handleViewUser = (userId) => {
    console.log('View user:', userId);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get status class
  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  // Get role class
  const getRoleClass = (role) => {
    return `role-${role}`;
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="manage-users-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-page">
      <div className="container">
        <h1 className="page-title">Manage Users</h1>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchUsers} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Filters Bar - Perfect Responsive Layout */}
        <div className="filters-bar">
          {/* Search Section - Laptop: Left, Mobile: Top */}
          <div className="search-section">
            <div className="search-wrapper">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              className="search-btn"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {/* Filter Buttons - Laptop: Right, Mobile: Bottom */}
          <div className="filter-section">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilter('all');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              All Users
              <span className="filter-count">{users.length}</span>
            </button>
            <button 
              className={`filter-btn ${filter === 'customer' ? 'active' : ''}`}
              onClick={() => {
                setFilter('customer');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Customers
              <span className="filter-count">
                {users.filter(u => u.role === 'customer').length}
              </span>
            </button>
            <button 
              className={`filter-btn ${filter === 'vendor' ? 'active' : ''}`}
              onClick={() => {
                setFilter('vendor');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Vendors
              <span className="filter-count">
                {users.filter(u => u.role === 'vendor').length}
              </span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          {users.length === 0 ? (
            <div className="no-results">
              <Icons.Users />
              <h3>No users found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Bookings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-phone">{user.phone}</span>
                      </td>
                      <td>
                        <span className={`role-badge ${getRoleClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className="join-date">{formatDate(user.joinedDate)}</span>
                      </td>
                      <td>
                        <span className="booking-count">{user.totalBookings || 0}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className={`btn-status ${user.status}`}
                            onClick={() => toggleUserStatus(user.id)}
                            disabled={processingId === user.id}
                          >
                            {processingId === user.id ? (
                              <span className="spinner-small"></span>
                            ) : (
                              user.status === 'active' ? 'Block' : 'Unblock'
                            )}
                          </button>
                          <button 
                            className="btn-view"
                            onClick={() => handleViewUser(user.id)}
                            title="View Details"
                          >
                            <Icons.Eye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    ← Previous
                  </button>
                  
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    className="page-btn"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;