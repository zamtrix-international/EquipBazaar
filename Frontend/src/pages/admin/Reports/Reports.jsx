// pages/admin/Reports/Reports.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../services/api';
import './Reports.css';

// Icon Components
const Icons = {
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
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
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Star: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  )
};

const Reports = () => {
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryStats, setSummaryStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeVendors: 0,
    avgRating: 0,
    bookingGrowth: 0,
    revenueGrowth: 0,
    vendorGrowth: 0,
    ratingGrowth: 0
  });

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getReports(reportType, { range: dateRange });

      if (response?.data?.success) {
        const data = response.data.data;
        setReportData(data);
        
        // Calculate summary stats from API data
        setSummaryStats({
          totalBookings: data.summary?.totalBookings || 0,
          totalRevenue: data.summary?.totalRevenue || 0,
          activeVendors: data.summary?.activeVendors || 0,
          avgRating: data.summary?.avgRating || 0,
          bookingGrowth: data.summary?.bookingGrowth || 0,
          revenueGrowth: data.summary?.revenueGrowth || 0,
          vendorGrowth: data.summary?.vendorGrowth || 0,
          ratingGrowth: data.summary?.ratingGrowth || 0
        });
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch report data');
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data. Please try again.');
      
      // Empty state
      setReportData({
        chartData: { labels: [], values: [] },
        equipmentData: [],
        topVendors: []
      });
      
      setSummaryStats({
        totalBookings: 0,
        totalRevenue: 0,
        activeVendors: 0,
        avgRating: 0,
        bookingGrowth: 0,
        revenueGrowth: 0,
        vendorGrowth: 0,
        ratingGrowth: 0
      });
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle export
  const handleExport = async () => {
    try {
      const response = await adminAPI.exportReport(reportType, { range: dateRange });
      
      if (response?.data?.success) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}-report-${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        throw new Error(response?.data?.message || 'Export failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(err.message || 'Failed to export report. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Get growth class
  const getGrowthClass = (value) => {
    return value >= 0 ? 'positive' : 'negative';
  };

  // Get growth symbol
  const getGrowthSymbol = (value) => {
    return value >= 0 ? '▲' : '▼';
  };

  // Loading state
  if (loading) {
    return (
      <div className="reports-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  const { chartData, equipmentData, topVendors } = reportData || {
    chartData: { labels: [], values: [] },
    equipmentData: [],
    topVendors: []
  };

  const maxChartValue = Math.max(...(chartData?.values || [0]), 1);

  return (
    <div className="reports-page">
      <div className="container">
        <h1 className="page-title">Reports & Analytics</h1>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchReportData} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Report Controls */}
        <div className="report-controls">
          <div className="control-group">
            <label>Report Type</label>
            <select 
              value={reportType} 
              onChange={(e) => {
                setReportType(e.target.value);
                setLoading(true);
              }}
            >
              <option value="bookings">Bookings Report</option>
              <option value="revenue">Revenue Report</option>
              <option value="equipment">Equipment Report</option>
              <option value="vendors">Vendor Report</option>
            </select>
          </div>

          <div className="control-group">
            <label>Date Range</label>
            <select 
              value={dateRange} 
              onChange={(e) => {
                setDateRange(e.target.value);
                setLoading(true);
              }}
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last 12 months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <button className="export-btn" onClick={handleExport}>
            <Icons.Download />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon bookings">
              <Icons.CalendarCheck />
            </div>
            <div className="summary-details">
              <span className="summary-label">Total Bookings</span>
              <span className="summary-value">{formatNumber(summaryStats.totalBookings)}</span>
              <span className={`summary-change ${getGrowthClass(summaryStats.bookingGrowth)}`}>
                {getGrowthSymbol(summaryStats.bookingGrowth)} {Math.abs(summaryStats.bookingGrowth)}%
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon revenue">
              <Icons.Rupee />
            </div>
            <div className="summary-details">
              <span className="summary-label">Total Revenue</span>
              <span className="summary-value">{formatCurrency(summaryStats.totalRevenue)}</span>
              <span className={`summary-change ${getGrowthClass(summaryStats.revenueGrowth)}`}>
                {getGrowthSymbol(summaryStats.revenueGrowth)} {Math.abs(summaryStats.revenueGrowth)}%
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon vendors">
              <Icons.Users />
            </div>
            <div className="summary-details">
              <span className="summary-label">Active Vendors</span>
              <span className="summary-value">{formatNumber(summaryStats.activeVendors)}</span>
              <span className={`summary-change ${getGrowthClass(summaryStats.vendorGrowth)}`}>
                {getGrowthSymbol(summaryStats.vendorGrowth)} {Math.abs(summaryStats.vendorGrowth)}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon rating">
              <Icons.Star />
            </div>
            <div className="summary-details">
              <span className="summary-label">Avg. Rating</span>
              <span className="summary-value">{summaryStats.avgRating.toFixed(1)}</span>
              <span className={`summary-change ${getGrowthClass(summaryStats.ratingGrowth)}`}>
                {getGrowthSymbol(summaryStats.ratingGrowth)} {Math.abs(summaryStats.ratingGrowth).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <h3>
              {reportType === 'bookings' ? 'Monthly Bookings Trend' : 
               reportType === 'revenue' ? 'Monthly Revenue Trend' : 
               reportType === 'equipment' ? 'Equipment Performance' : 
               'Vendor Performance'}
            </h3>
            <div className="chart-container">
              {chartData.labels.length > 0 ? (
                <div className="bar-chart">
                  {chartData.labels.map((label, index) => (
                    <div key={label} className="chart-bar">
                      <span className="bar-label">{label}</span>
                      <div className="bar-wrapper">
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{
                              width: `${(chartData.values[index] / maxChartValue) * 100}%`
                            }}
                          >
                            <span className="bar-value-tooltip">
                              {reportType === 'revenue' 
                                ? formatCurrency(chartData.values[index])
                                : chartData.values[index]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-chart-data">
                  <p>No data available for selected period</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Equipment Performance</h3>
            {equipmentData.length > 0 ? (
              <div className="equipment-stats">
                {equipmentData.map((item, index) => (
                  <div key={index} className="equipment-stat">
                    <div className="stat-header">
                      <span className="equipment-name">{item.name}</span>
                      <span className="equipment-bookings">{item.bookings} bookings</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(item.bookings / Math.max(...equipmentData.map(d => d.bookings), 1)) * 100}%` }}
                      >
                        <span className="progress-tooltip">{item.bookings}</span>
                      </div>
                    </div>
                    <div className="stat-footer">
                      <span>Revenue: {formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No equipment data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Vendors Table */}
        <div className="top-vendors-section">
          <h3>Top Performing Vendors</h3>
          {topVendors.length > 0 ? (
            <div className="table-responsive">
              <table className="vendors-table">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Total Bookings</th>
                    <th>Total Revenue</th>
                    <th>Rating</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {topVendors.map((vendor, index) => (
                    <tr key={index}>
                      <td>
                        <div className="vendor-name-cell">
                          <span className="vendor-rank">{index + 1}</span>
                          {vendor.name}
                        </div>
                      </td>
                      <td>{formatNumber(vendor.bookings)}</td>
                      <td>{formatCurrency(vendor.revenue)}</td>
                      <td>
                        <div className="rating">
                          <span className="stars">
                            {'★'.repeat(Math.floor(vendor.rating))}
                            {'☆'.repeat(5 - Math.floor(vendor.rating))}
                          </span>
                          <span className="rating-value">{vendor.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="performance-bar-container">
                          <div className="performance-bar">
                            <div 
                              className="performance-fill"
                              style={{ width: `${(vendor.bookings / Math.max(...topVendors.map(v => v.bookings), 1)) * 100}%` }}
                            >
                              <span className="performance-tooltip">{vendor.bookings}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No vendor data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;