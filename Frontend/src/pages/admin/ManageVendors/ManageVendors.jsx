// pages/admin/ManageVendors/ManageVendors.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../services/api';
import './ManageVendors.css';

// Icon Components
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Truck: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
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

const ManageVendors = () => {
  const [vendors, setVendors] = useState([]);
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

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filter !== 'all') params.status = filter;
      if (searchTerm) params.search = searchTerm;

      const response = await adminAPI.getUsers(params);

      let userList = [];
      if (response?.data?.success) {
        userList = response.data.data?.users || response.data.data?.rows || [];
      } else if (Array.isArray(response?.data)) {
        userList = response.data;
      } else if (response?.data?.users) {
        userList = response.data.users;
      }

      // Filter vendors from users (backend may return all users)
      const vendorUsers = userList.filter((u) => u.role === 'VENDOR' || u.role === 'vendor');
      const normalizedVendors = vendorUsers.map((vendor) => ({
        ...vendor,
        status:
          vendor.status === 'blocked'
            ? 'suspended'
            : vendor.status === 'active'
              ? 'approved'
              : vendor.status || 'pending',
        kycStatus: vendor.kycStatus || 'pending',
      }));

      setVendors(normalizedVendors);
      setPagination(prev => ({
        ...prev,
        total: response?.data?.data?.count || response?.data?.total || normalizedVendors.length,
        pages: response?.data?.data?.pages || response?.data?.pages || 1
      }));
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(err.message || 'Failed to load vendors. Please try again.');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filter, searchTerm]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchVendors();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchVendors]);

  // Handle manual search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchVendors();
  };

  // Update vendor status
  const updateVendorStatus = async (vendorId, newStatus) => {
    setProcessingId(vendorId);
    setError('');

    try {
      const response = await adminAPI.updateVendorStatus(vendorId, newStatus);

      if (response?.data?.success) {
        setVendors(prev => 
          prev.map(vendor => 
            vendor.id === vendorId 
              ? { ...vendor, status: newStatus }
              : vendor
          )
        );
      } else {
        setError(response?.data?.message || 'Vendor status action is not available on this backend.');
      }
    } catch (err) {
      console.warn('API updateVendorStatus not available:', err.message || err);
      setError(err.response?.data?.message || err.message || 'Vendor status action is not available on this backend.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle view vendor details
  const handleViewVendor = (vendorId) => {
    console.log('View vendor:', vendorId);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get status button based on current status
  const getStatusButton = (vendor) => {
    switch (vendor.status) {
      case 'pending':
        return (
          <div className="action-buttons">
            <button 
              className="btn-approve"
              onClick={() => updateVendorStatus(vendor.id, 'approved')}
              disabled={processingId === vendor.id}
              title="Approve Vendor"
            >
              {processingId === vendor.id ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <Icons.Check />
                  <span>Approve</span>
                </>
              )}
            </button>
            <button 
              className="btn-reject"
              onClick={() => updateVendorStatus(vendor.id, 'suspended')}
              disabled={processingId === vendor.id}
              title="Reject Vendor"
            >
              {processingId === vendor.id ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <Icons.X />
                  <span>Reject</span>
                </>
              )}
            </button>
          </div>
        );

      case 'approved':
        return (
          <div className="action-buttons">
            <button 
              className="btn-suspend"
              onClick={() => updateVendorStatus(vendor.id, 'suspended')}
              disabled={processingId === vendor.id}
              title="Suspend Vendor"
            >
              {processingId === vendor.id ? (
                <span className="spinner-small"></span>
              ) : (
                'Suspend'
              )}
            </button>
          </div>
        );

      case 'suspended':
        return (
          <div className="action-buttons">
            <button 
              className="btn-activate"
              onClick={() => updateVendorStatus(vendor.id, 'approved')}
              disabled={processingId === vendor.id}
              title="Activate Vendor"
            >
              {processingId === vendor.id ? (
                <span className="spinner-small"></span>
              ) : (
                'Activate'
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading && vendors.length === 0) {
    return (
      <div className="manage-vendors-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading vendors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-vendors-page">
      <div className="container">
        <h1 className="page-title">Manage Vendors</h1>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchVendors} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Filters Bar - Perfect Responsive Layout */}
        <div className="filters-bar">
          {/* Search Section - Laptop: Left side, Mobile: Top */}
          <div className="search-section">
            <div className="search-wrapper">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search by name, email or business..."
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

          {/* Filter Buttons - Laptop: Right side, Mobile: Bottom */}
          <div className="filter-section">
            {['all', 'pending', 'approved', 'suspended'].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => {
                  setFilter(f);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="filter-count">
                    {vendors.filter(v => v.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Table */}
        <div className="vendors-table-container">
          {vendors.length === 0 ? (
            <div className="no-results">
              <Icons.Truck />
              <h3>No vendors found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <table className="vendors-table">
                <thead>
                  <tr>
                    <th>Vendor Details</th>
                    <th>Business</th>
                    <th>Equipment</th>
                    <th>KYC Status</th>
                    <th>Bookings</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(vendor => (
                    <tr key={vendor.id}>
                      <td>
                        <div className="vendor-info">
                          <div className="vendor-avatar">
                            {vendor.name?.charAt(0) || 'V'}
                          </div>
                          <div>
                            <div className="vendor-name">{vendor.name}</div>
                            <div className="vendor-email">{vendor.email}</div>
                            <div className="vendor-phone">{vendor.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="business-info">
                          <div className="business-name">{vendor.businessName}</div>
                          <div className="equipment-count">{vendor.totalEquipment || 0} equipment</div>
                          <div className="joined-date">Joined {formatDate(vendor.joinedDate)}</div>
                        </div>
                      </td>

                      <td>
                        <div className="equipment-tags">
                          {vendor.equipment?.map((item, index) => (
                            <span key={index} className="equipment-tag">{item}</span>
                          ))}
                        </div>
                      </td>

                      <td>
                        <span className={`kyc-badge ${vendor.kycStatus}`}>
                          {vendor.kycStatus}
                        </span>
                      </td>

                      <td>
                        <span className="booking-count">{vendor.totalBookings || 0}</span>
                      </td>

                      <td>
                        {vendor.rating > 0 ? (
                          <div className="rating">
                            <span className="stars">
                              {'★'.repeat(Math.floor(vendor.rating))}
                              {'☆'.repeat(5 - Math.floor(vendor.rating))}
                            </span>
                            <span className="rating-value">{vendor.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="no-rating">No ratings</span>
                        )}
                      </td>

                      <td>
                        <span className={`status-badge ${vendor.status}`}>
                          {vendor.status}
                        </span>
                      </td>

                      <td>
                        {getStatusButton(vendor)}
                        <button 
                          className="btn-view"
                          onClick={() => handleViewVendor(vendor.id)}
                          title="View Details"
                        >
                          <Icons.Eye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="pagination-btn"
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

export default ManageVendors;