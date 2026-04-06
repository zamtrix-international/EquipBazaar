// pages/admin/AdminSettings/AdminSettings.jsx
import { useState, useEffect } from 'react';
import { settingsAPI } from '../../../services/api';
import './AdminSettings.css';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Payment Gateway Config
  const [paymentConfig, setPaymentConfig] = useState({
    Razorpay: {
      gateway: 'RAZORPAY',
      isEnabled: false,
      mode: 'TEST',
      apiKey: '',
      apiSecret: '',
      webhookSecret: '',
    },
    Cashfree: {
      gateway: 'CASHFREE',
      isEnabled: false,
      mode: 'TEST',
      apiKey: '',
      apiSecret: '',
      webhookSecret: '',
    },
  });

  // App Settings
  const [appSettings, setAppSettings] = useState({
    COMMISSION_PERCENTAGE: '10',
    MIN_VENDOR_BALANCE: '1000',
    MAX_BOOKING_DURATION: '30',
    SUPPORT_EMAIL: 'support@equipbazaar.com',
  });

  const [formChanged, setFormChanged] = useState({
    payment: false,
    appSettings: false,
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch initial data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [paymentRes, appRes] = await Promise.all([
          settingsAPI.getPaymentGatewayConfig(),
          settingsAPI.getAppSettings(),
        ]);

        // Process payment gateway config
        if (paymentRes?.data?.data) {
          const configs = Array.isArray(paymentRes.data.data)
            ? paymentRes.data.data
            : [paymentRes.data.data];

          const updated = { ...paymentConfig };
          configs.forEach((config) => {
            if (config.gateway === 'RAZORPAY') {
              updated.Razorpay = {
                ...config,
              };
            } else if (config.gateway === 'CASHFREE') {
              updated.Cashfree = {
                ...config,
              };
            }
          });
          setPaymentConfig(updated);
        }

        // Process app settings
        if (appRes?.data?.data) {
          const settings = Array.isArray(appRes.data.data)
            ? appRes.data.data
            : [appRes.data.data];

          const updated = { ...appSettings };
          settings.forEach((setting) => {
            updated[setting.keyName] = setting.valueText;
          });
          setAppSettings(updated);
        }

        setError('');
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load settings'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle payment config change
  const handlePaymentChange = (gateway, field, value) => {
    setPaymentConfig((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value,
      },
    }));
    setFormChanged((prev) => ({ ...prev, payment: true }));
  };

  // Handle app settings change
  const handleAppSettingChange = (key, value) => {
    setAppSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setFormChanged((prev) => ({ ...prev, appSettings: true }));
  };

  // Save payment gateway config
  const savePaymentConfig = async (gateway) => {
    try {
      const config = paymentConfig[gateway];
      const response = await settingsAPI.updatePaymentGatewayConfig(config);

      if (response?.data?.success) {
        showToast(`${gateway} configuration updated successfully!`);
        setFormChanged((prev) => ({ ...prev, payment: false }));
      } else {
        throw new Error(response?.data?.message || 'Failed to save config');
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || err?.message || 'Failed to save config',
        'error'
      );
    }
  };

  // Save app setting
  const saveAppSetting = async (key) => {
    try {
      const value = appSettings[key];
      const response = await settingsAPI.updateAppSetting({
        keyName: key,
        valueText: String(value),
      });

      if (response?.data?.success) {
        showToast(`${key} updated successfully!`);
        setFormChanged((prev) => ({ ...prev, appSettings: false }));
      } else {
        throw new Error(response?.data?.message || 'Failed to save setting');
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || err?.message || 'Failed to save setting',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-page">
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <div className="container">
        {/* Header */}
        <div className="settings-header">
          <h1>Admin Settings</h1>
          <p>Configure payment gateways and application settings</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Payment Gateway Settings */}
        <section className="settings-section">
          <div className="section-header">
            <h2>Payment Gateway Configuration</h2>
            <p className="section-description">
              Enable and configure payment gateways for your platform
            </p>
          </div>

          <div className="gateways-grid">
            {/* Razorpay Config */}
            <div className="gateway-card">
              <div className="gateway-header">
                <h3>Razorpay</h3>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={paymentConfig.Razorpay.isEnabled}
                    onChange={(e) =>
                      handlePaymentChange('Razorpay', 'isEnabled', e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Mode</label>
                <select
                  className="form-input"
                  value={paymentConfig.Razorpay.mode}
                  onChange={(e) =>
                    handlePaymentChange('Razorpay', 'mode', e.target.value)
                  }
                >
                  <option value="TEST">Test</option>
                  <option value="LIVE">Live</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter API Key"
                  value={paymentConfig.Razorpay.apiKey}
                  onChange={(e) =>
                    handlePaymentChange('Razorpay', 'apiKey', e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">API Secret</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter API Secret"
                  value={paymentConfig.Razorpay.apiSecret}
                  onChange={(e) =>
                    handlePaymentChange('Razorpay', 'apiSecret', e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Webhook Secret</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter Webhook Secret"
                  value={paymentConfig.Razorpay.webhookSecret}
                  onChange={(e) =>
                    handlePaymentChange('Razorpay', 'webhookSecret', e.target.value)
                  }
                />
              </div>

              <button
                className="btn-save"
                onClick={() => savePaymentConfig('Razorpay')}
              >
                Save Configuration
              </button>
            </div>

            {/* Cashfree Config */}
            <div className="gateway-card">
              <div className="gateway-header">
                <h3>Cashfree</h3>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={paymentConfig.Cashfree.isEnabled}
                    onChange={(e) =>
                      handlePaymentChange('Cashfree', 'isEnabled', e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Mode</label>
                <select
                  className="form-input"
                  value={paymentConfig.Cashfree.mode}
                  onChange={(e) =>
                    handlePaymentChange('Cashfree', 'mode', e.target.value)
                  }
                >
                  <option value="TEST">Test</option>
                  <option value="LIVE">Live</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter API Key"
                  value={paymentConfig.Cashfree.apiKey}
                  onChange={(e) =>
                    handlePaymentChange('Cashfree', 'apiKey', e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">API Secret</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter API Secret"
                  value={paymentConfig.Cashfree.apiSecret}
                  onChange={(e) =>
                    handlePaymentChange('Cashfree', 'apiSecret', e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Webhook Secret</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter Webhook Secret"
                  value={paymentConfig.Cashfree.webhookSecret}
                  onChange={(e) =>
                    handlePaymentChange('Cashfree', 'webhookSecret', e.target.value)
                  }
                />
              </div>

              <button
                className="btn-save"
                onClick={() => savePaymentConfig('Cashfree')}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </section>

        {/* App Settings */}
        <section className="settings-section">
          <div className="section-header">
            <h2>Application Settings</h2>
            <p className="section-description">
              Configure general application settings and parameters
            </p>
          </div>

          <div className="app-settings-grid">
            {/* Commission Percentage */}
            <div className="setting-item">
              <label className="form-label">Commission Percentage (%)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter commission percentage"
                  value={appSettings.COMMISSION_PERCENTAGE}
                  onChange={(e) =>
                    handleAppSettingChange('COMMISSION_PERCENTAGE', e.target.value)
                  }
                  min="0"
                  max="100"
                  step="0.01"
                />
                <button
                  className="btn-save-small"
                  onClick={() => saveAppSetting('COMMISSION_PERCENTAGE')}
                >
                  Save
                </button>
              </div>
            </div>

            {/* Min Vendor Balance */}
            <div className="setting-item">
              <label className="form-label">Min Vendor Balance (₹)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter minimum balance"
                  value={appSettings.MIN_VENDOR_BALANCE}
                  onChange={(e) =>
                    handleAppSettingChange('MIN_VENDOR_BALANCE', e.target.value)
                  }
                  min="0"
                  step="1"
                />
                <button
                  className="btn-save-small"
                  onClick={() => saveAppSetting('MIN_VENDOR_BALANCE')}
                >
                  Save
                </button>
              </div>
            </div>

            {/* Max Booking Duration */}
            <div className="setting-item">
              <label className="form-label">Max Booking Duration (days)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter max duration"
                  value={appSettings.MAX_BOOKING_DURATION}
                  onChange={(e) =>
                    handleAppSettingChange('MAX_BOOKING_DURATION', e.target.value)
                  }
                  min="1"
                  step="1"
                />
                <button
                  className="btn-save-small"
                  onClick={() => saveAppSetting('MAX_BOOKING_DURATION')}
                >
                  Save
                </button>
              </div>
            </div>

            {/* Support Email */}
            <div className="setting-item">
              <label className="form-label">Support Email</label>
              <div className="input-group">
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter support email"
                  value={appSettings.SUPPORT_EMAIL}
                  onChange={(e) =>
                    handleAppSettingChange('SUPPORT_EMAIL', e.target.value)
                  }
                />
                <button
                  className="btn-save-small"
                  onClick={() => saveAppSetting('SUPPORT_EMAIL')}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
