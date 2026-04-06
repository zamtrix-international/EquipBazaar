// pages/admin/CommissionSettings/CommissionSettings.jsx
import { useState, useEffect, useCallback } from 'react';
import { commissionAPI } from '../../../services/api';
import './CommissionSettings.css';

// Icon Components
const Icons = {
  Save: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  ToggleOn: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
      <circle cx="16" cy="12" r="5"></circle>
    </svg>
  ),
  ToggleOff: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
      <circle cx="8" cy="12" r="5"></circle>
    </svg>
  ),
  Info: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <circle cx="12" cy="8" r="1" fill="currentColor"></circle>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  )
};

const CommissionSettings = () => {
  const [commissionRules, setCommissionRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch commission rules
  const fetchCommissionRules = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await commissionAPI.getCommissionRule();

      if (response?.data?.success) {
        setCommissionRules(response.data.data.rules || [response.data.data]);
      } else if (response?.data?.rules) {
        setCommissionRules(response.data.rules);
      } else if (response?.data) {
        setCommissionRules([response.data]);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch commission rules');
      }
    } catch (err) {
      console.error('Error fetching commission rules:', err);
      setError(err.message || 'Failed to load commission settings. Please try again.');
      setCommissionRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissionRules();
  }, [fetchCommissionRules]);

  // Handle rule change
  const handleRuleChange = (id, field, value) => {
    // Validate percentage range (5-15)
    if (field === 'commissionPercentage') {
      if (value < 5) value = 5;
      if (value > 15) value = 15;
    }
    
    // Validate min/max (non-negative)
    if (field === 'minCommission' || field === 'maxCommission') {
      if (value < 0) value = 0;
    }

    setCommissionRules(rules =>
      rules.map(rule =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
    
    // Clear messages when user makes changes
    setError('');
    setSuccess('');
  };

  // Handle save rules
  const handleSaveRules = async () => {
    // Validate rules before saving
    for (const rule of commissionRules) {
      if (rule.minCommission > rule.maxCommission) {
        setError(`Min commission cannot be greater than max commission for ${rule.equipmentType}`);
        return;
      }
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await commissionAPI.updateCommissionRule({ rules: commissionRules });

      if (response?.data?.success) {
        setSuccess('Commission rules updated successfully!');
        // Refresh data
        fetchCommissionRules();
      } else {
        throw new Error(response?.data?.message || 'Failed to update commission rules');
      }
    } catch (err) {
      console.error('Error updating commission rules:', err);
      setError(err.message || 'Failed to update commission rules. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle rule status
  const toggleRuleStatus = async (id) => {
    const rule = commissionRules.find(r => r.id === id);
    const newStatus = !rule.isActive;

    setCommissionRules(rules =>
      rules.map(rule =>
        rule.id === id ? { ...rule, isActive: newStatus } : rule
      )
    );
  };

  // Calculate example
  const calculateExample = (rule, amount = 2000) => {
    if (!rule) return 0;
    
    let commission = (amount * rule.commissionPercentage) / 100;
    
    if (commission < rule.minCommission) {
      commission = rule.minCommission;
    } else if (commission > rule.maxCommission) {
      commission = rule.maxCommission;
    }
    
    return commission;
  };

  // Loading state
  if (loading) {
    return (
      <div className="commission-settings-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading commission settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="commission-settings-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Commission Settings</h1>
          <p className="page-subtitle">Manage commission rates for different equipment types (5% - 15% range)</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <Icons.Check />
            <p>{success}</p>
          </div>
        )}

        {/* Commission Rules */}
        <div className="commission-rules">
          <div className="rules-header">
            <h2>Commission Rules</h2>
            <button
              onClick={handleSaveRules}
              disabled={saving}
              className="btn-save"
            >
              {saving ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Icons.Save />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {commissionRules.length === 0 ? (
            <div className="no-rules">
              <p>No commission rules found</p>
            </div>
          ) : (
            <div className="rules-table">
              {/* Table Header - Desktop */}
              <div className="table-header desktop-only">
                <div>Equipment Type</div>
                <div>Commission %</div>
                <div>Min Commission (₹)</div>
                <div>Max Commission (₹)</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Rules List */}
              {commissionRules.map(rule => (
                <div key={rule.id} className="table-row">
                  {/* Equipment Type */}
                  <div className="equipment-type">
                    <span className="mobile-label">Equipment Type:</span>
                    <strong>{rule.equipmentType}</strong>
                  </div>

                  {/* Commission Percentage */}
                  <div className="commission-input">
                    <span className="mobile-label">Commission %:</span>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        min="5"
                        max="15"
                        step="0.5"
                        value={rule.commissionPercentage}
                        onChange={(e) => handleRuleChange(rule.id, 'commissionPercentage', parseFloat(e.target.value) || 5)}
                        className="percentage-input"
                      />
                      <span className="percentage-symbol">%</span>
                    </div>
                  </div>

                  {/* Min Commission */}
                  <div className="min-commission">
                    <span className="mobile-label">Min Commission:</span>
                    <div className="input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={rule.minCommission}
                        onChange={(e) => handleRuleChange(rule.id, 'minCommission', parseInt(e.target.value) || 0)}
                        className="amount-input"
                      />
                    </div>
                  </div>

                  {/* Max Commission */}
                  <div className="max-commission">
                    <span className="mobile-label">Max Commission:</span>
                    <div className="input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={rule.maxCommission}
                        onChange={(e) => handleRuleChange(rule.id, 'maxCommission', parseInt(e.target.value) || 0)}
                        className="amount-input"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="status">
                    <span className="mobile-label">Status:</span>
                    <span className={`status-badge ${rule.isActive ? 'active' : 'inactive'}`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="actions">
                    <span className="mobile-label">Actions:</span>
                    <button
                      onClick={() => toggleRuleStatus(rule.id)}
                      className={`btn-toggle ${rule.isActive ? 'deactivate' : 'activate'}`}
                      title={rule.isActive ? 'Deactivate Rule' : 'Activate Rule'}
                    >
                      {rule.isActive ? <Icons.ToggleOn /> : <Icons.ToggleOff />}
                      <span className="btn-text">{rule.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commission Information */}
        <div className="commission-info">
          <h3>
            <Icons.Info />
            Commission Calculation
          </h3>
          
          <div className="info-grid">
            <div className="info-card">
              <h4>How Commission Works</h4>
              <ul>
                <li>
                  <Icons.Check />
                  <span>Commission is calculated on the booking amount</span>
                </li>
                <li>
                  <Icons.Check />
                  <span>Minimum commission ensures fair earnings</span>
                </li>
                <li>
                  <Icons.Check />
                  <span>Maximum commission caps high-value bookings</span>
                </li>
                <li>
                  <Icons.Check />
                  <span>Percentage applies within min-max range</span>
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h4>Example Calculation</h4>
              {commissionRules.length > 0 && (
                <div className="example">
                  <div className="example-item">
                    <p className="example-title">For {commissionRules[0].equipmentType}:</p>
                    <div className="example-details">
                      <p><span>Booking Amount:</span> <strong>₹2,000</strong></p>
                      <p><span>Commission Rate:</span> <strong>{commissionRules[0].commissionPercentage}%</strong></p>
                      <p><span>Min Commission:</span> <strong>₹{commissionRules[0].minCommission}</strong></p>
                      <p><span>Max Commission:</span> <strong>₹{commissionRules[0].maxCommission}</strong></p>
                      <p className="example-result">
                        <span>Commission Earned:</span>
                        <strong className="highlight">₹{calculateExample(commissionRules[0])}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="info-card">
              <h4>Commission Range Guide</h4>
              <div className="range-guide">
                <div className="guide-item">
                  <span className="guide-label">Minimum Range:</span>
                  <span className="guide-value">5% - ₹50</span>
                </div>
                <div className="guide-item">
                  <span className="guide-label">Maximum Range:</span>
                  <span className="guide-value">15% - ₹2000</span>
                </div>
                <div className="guide-item">
                  <span className="guide-label">Default Rate:</span>
                  <span className="guide-value">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionSettings;