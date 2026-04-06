// pages/admin/Analytics/Analytics.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../services/api';
import './Analytics.css';

// Icon Components
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
  Rupee: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h12M6 8h12M14 18l4 3M6 13h8a4 4 0 0 0 0-8H6"></path>
    </svg>
  ),
  Cogs: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.09A10 10 0 0 0 12 18a10 10 0 0 0 6.26-2.22z"></path>
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
  TrendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8 10 1 17"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  TrendingDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8 14 1 7"></polyline>
      <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
  ),
  Minus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  )
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getAnalytics({ range: timeRange });

      if (response?.data?.success) {
        setAnalyticsData(response.data.data);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics. Please try again.');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <Icons.TrendingUp />;
    if (change < 0) return <Icons.TrendingDown />;
    return <Icons.Minus />;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="container">
          <div className="error-state">
            <span>⚠️</span>
            <h2>Error Loading Analytics</h2>
            <p>{error}</p>
            <button onClick={fetchAnalytics} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-page">
        <div className="container">
          <div className="empty-state">
            <h2>No Data Available</h2>
            <p>No analytics data found for the selected period.</p>
          </div>
        </div>
      </div>
    );
  }

  const { overview, bookingsTrend, revenueByCategory, topEquipment, userGrowth } = analyticsData;

  return (
    <div className="analytics-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-subtitle">Track your platform's performance metrics</p>
          </div>
          <div className="header-right">
            <div className="time-range-selector">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-select"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-cards">
          <div className="metric-card metric-bookings">
            <div className="metric-icon">
              <Icons.CalendarCheck />
            </div>
            <div className="metric-content">
              <span className="metric-label">Total Bookings</span>
              <h3 className="metric-value">{formatNumber(overview.totalBookings)}</h3>
              <div className="metric-footer">
                <span className={`metric-change ${overview.bookingsChange >= 0 ? 'positive' : 'negative'}`}>
                  {getChangeIcon(overview.bookingsChange)}
                  {Math.abs(overview.bookingsChange)}%
                </span>
                <span className="metric-period">vs last period</span>
              </div>
            </div>
          </div>

          <div className="metric-card metric-revenue">
            <div className="metric-icon">
              <Icons.Rupee />
            </div>
            <div className="metric-content">
              <span className="metric-label">Total Revenue</span>
              <h3 className="metric-value">{formatCurrency(overview.totalRevenue)}</h3>
              <div className="metric-footer">
                <span className={`metric-change ${overview.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                  {getChangeIcon(overview.revenueChange)}
                  {Math.abs(overview.revenueChange)}%
                </span>
                <span className="metric-period">vs last period</span>
              </div>
            </div>
          </div>

          <div className="metric-card metric-equipment">
            <div className="metric-icon">
              <Icons.Cogs />
            </div>
            <div className="metric-content">
              <span className="metric-label">Active Equipment</span>
              <h3 className="metric-value">{formatNumber(overview.activeEquipment)}</h3>
              <div className="metric-footer">
                <span className="metric-change neutral">
                  <Icons.Minus />
                  {overview.equipmentChange}
                </span>
                <span className="metric-period">from last period</span>
              </div>
            </div>
          </div>

          <div className="metric-card metric-users">
            <div className="metric-icon">
              <Icons.Users />
            </div>
            <div className="metric-content">
              <span className="metric-label">Total Users</span>
              <h3 className="metric-value">{formatNumber(overview.totalUsers)}</h3>
              <div className="metric-footer">
                <span className={`metric-change ${overview.usersChange >= 0 ? 'positive' : 'negative'}`}>
                  {getChangeIcon(overview.usersChange)}
                  {Math.abs(overview.usersChange)}%
                </span>
                <span className="metric-period">vs last period</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Bookings Trend Chart */}
          <div className="chart-card">
            <h2>Bookings Trend</h2>
            <div className="chart-container">
              <div className="bar-chart">
                {bookingsTrend.map((item, index) => {
                  const maxValue = Math.max(...bookingsTrend.map(d => d.bookings));
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar"
                          style={{ 
                            height: `${(item.bookings / maxValue) * 100}%`
                          }}
                        >
                          <span className="bar-tooltip">{item.bookings}</span>
                        </div>
                      </div>
                      <span className="bar-label">
                        {new Date(item.date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="chart-card">
            <h2>Revenue by Category</h2>
            <div className="chart-container">
              <div className="category-list">
                {revenueByCategory.map((item, index) => {
                  const maxRevenue = Math.max(...revenueByCategory.map(d => d.revenue));
                  return (
                    <div key={index} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{item.category}</span>
                        <span className="category-revenue">{formatCurrency(item.revenue)}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${(item.revenue / maxRevenue) * 100}%`,
                            background: index === 0 ? 'var(--yellow-primary)' : 
                                       index === 1 ? 'var(--yellow-dark)' : 
                                       'var(--yellow-light)'
                          }}
                        >
                          <span className="progress-tooltip">{item.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Equipment */}
          <div className="chart-card">
            <h2>Top Performing Equipment</h2>
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topEquipment.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="equipment-cell">
                          <span className="equipment-rank">{index + 1}</span>
                          {item.name}
                        </div>
                      </td>
                      <td className="text-center">{formatNumber(item.bookings)}</td>
                      <td className="text-right">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Growth */}
          <div className="chart-card">
            <h2>User Growth</h2>
            <div className="chart-container">
              <div className="line-chart">
                <svg className="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    points={userGrowth.map((item, index) => {
                      const maxUsers = Math.max(...userGrowth.map(d => d.users));
                      const x = (index / (userGrowth.length - 1)) * 100;
                      const y = 100 - (item.users / maxUsers) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="var(--yellow-primary)"
                    strokeWidth="2"
                  />
                  {userGrowth.map((item, index) => {
                    const maxUsers = Math.max(...userGrowth.map(d => d.users));
                    const x = (index / (userGrowth.length - 1)) * 100;
                    const y = 100 - (item.users / maxUsers) * 100;
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="2"
                        fill="var(--yellow-primary)"
                        className="chart-point"
                      >
                        <title>{item.users} users</title>
                      </circle>
                    );
                  })}
                </svg>
                <div className="chart-labels">
                  {userGrowth.map((item, index) => (
                    <span key={index} className="chart-label">{item.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-card">
            <h3>Key Insights</h3>
            <ul className="insights-list">
              <li>
                <span className="insight-badge positive">↑</span>
                <span>Bookings increased by {overview.bookingsChange}% this period</span>
              </li>
              <li>
                <span className="insight-badge positive">↑</span>
                <span>Revenue growth of {overview.revenueChange}%</span>
              </li>
              <li>
                <span className="insight-badge neutral">→</span>
                <span>Active equipment: {overview.activeEquipment} units</span>
              </li>
              <li>
                <span className="insight-badge positive">↑</span>
                <span>User base expanded by {overview.usersChange}%</span>
              </li>
            </ul>
          </div>
          <div className="summary-card">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Avg. Daily Bookings</span>
                <span className="stat-value">{Math.round(overview.totalBookings / 30)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg. Revenue/Day</span>
                <span className="stat-value">{formatCurrency(overview.totalRevenue / 30)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Conversion Rate</span>
                <span className="stat-value">{(overview.totalBookings / overview.totalUsers * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;