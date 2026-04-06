// pages/Module/EquipmentList/EquipmentList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import EquipmentCard from '../../../components/EquipmentCard/EquipmentCard';
import { equipmentAPI } from '../../../services/api';
import './EquipmentList.css';

const EquipmentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // ✅ Fetch ALL equipment from API
  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare query parameters for filtering
      const params = {};
      
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.location) params.location = filters.location;
      
      // Add pagination params
      params.page = pagination.page;
      params.limit = pagination.limit;
      
      // ✅ Call getAll API
      const response = await equipmentAPI.getAll(params);
      
      console.log('Full API Response:', response);
      
      // ✅ Handle the response structure from your backend
      // Response structure: response.data.data = { success, statusCode, message, data: { count, rows } }
      let equipmentData = [];
      let totalCount = 0;
      
      if (response?.data?.data?.data) {
        // Case: response.data.data.data (nested data object)
        const responseData = response.data.data.data;
        
        if (responseData.rows && Array.isArray(responseData.rows)) {
          equipmentData = responseData.rows;
          totalCount = responseData.count || equipmentData.length;
        } else if (Array.isArray(responseData)) {
          equipmentData = responseData;
          totalCount = equipmentData.length;
        }
      } 
      else if (response?.data?.data?.rows && Array.isArray(response.data.data.rows)) {
        // Case: response.data.data.rows (direct access)
        equipmentData = response.data.data.rows;
        totalCount = response.data.data.count || equipmentData.length;
      }
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Case: response.data.data is array
        equipmentData = response.data.data;
        totalCount = equipmentData.length;
      }
      else if (response?.data?.rows && Array.isArray(response.data.rows)) {
        // Case: response.data.rows
        equipmentData = response.data.rows;
        totalCount = response.data.count || equipmentData.length;
      }
      else if (response?.data && Array.isArray(response.data)) {
        // Case: response.data is array
        equipmentData = response.data;
        totalCount = equipmentData.length;
      }
      else {
        console.warn('Unexpected response structure:', response?.data);
        equipmentData = [];
        totalCount = 0;
      }
      
      console.log('Processed Equipment Data:', equipmentData);
      console.log('Total Count:', totalCount);
      
      setEquipment(equipmentData);
      setPagination(prev => ({
        ...prev,
        total: totalCount,
        pages: Math.ceil(totalCount / prev.limit)
      }));
      
    } catch (err) {
      console.error('Equipment fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch equipment. Please try again.');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.location, pagination.page, pagination.limit]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Update URL params when filters or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (pagination.page > 1) params.set('page', pagination.page);
    setSearchParams(params);
  }, [filters, pagination.page, setSearchParams]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      location: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const closeFilters = useCallback(() => {
    setShowFilters(false);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get unique categories from equipment list
  const categories = [...new Set(equipment.map(item => item?.category).filter(Boolean))].sort();

  // Loading state
  if (loading && equipment.length === 0) {
    return (
      <div className="equipment-list-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading equipment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-list-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            Available Equipment {filters.location && `in ${filters.location}`}
          </h1>
          <p className="results-count">
            {pagination.total} {pagination.total === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {error && (
          <div className="error-state" role="alert">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchEquipment} className="btn btn-secondary btn-sm">
              Retry
            </button>
          </div>
        )}

        <button 
          className="mobile-filter-toggle"
          onClick={toggleFilters}
          aria-expanded={showFilters}
        >
          <svg className="filter-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" fill="currentColor"/>
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="content-layout">
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h2>Filters</h2>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All
              </button>
              <button className="close-filters-btn" onClick={closeFilters}>×</button>
            </div>

            <div className="filters-content">
              <div className="filter-section">
                <label htmlFor="category-filter" className="filter-label">Category</label>
                <select
                  id="category-filter"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="filter-section">
                <label className="filter-label">Price Range (per hour)</label>
                <div className="price-range">
                  <div className="price-input">
                    <span className="currency">₹</span>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      min="0"
                      step="100"
                    />
                  </div>
                  <span className="price-separator">to</span>
                  <div className="price-input">
                    <span className="currency">₹</span>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <label htmlFor="location-filter" className="filter-label">Location</label>
                <input
                  type="text"
                  id="location-filter"
                  name="location"
                  placeholder="Enter city/area"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>

              <button className="apply-filters-btn" onClick={closeFilters}>
                Apply Filters
              </button>
            </div>
          </aside>

          <main className="equipment-grid-container">
            <div className="equipment-grid">
              {equipment.length > 0 ? (
                equipment.map(item => (
                  <EquipmentCard key={item._id || item.id} equipment={item} />
                ))
              ) : (
                !loading && !error && (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No equipment found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                    <button onClick={clearFilters} className="btn btn-primary">
                      Clear Filters
                    </button>
                  </div>
                )
              )}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EquipmentList;