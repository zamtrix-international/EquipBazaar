// pages/vendor/Earnings/Earnings.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { payoutAPI, vendorAPI, walletAPI } from '../../../services/api';
import { showConfirm, showSuccess, showError } from '../../../utils/sweetalert';
import './Earnings.css';

// Icon Components
const Icons = {
  Rupee: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h12M6 8h12M14 18l4 3M6 13h8a4 4 0 0 0 0-8H6"></path>
    </svg>
  ),
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  Withdraw: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"></path>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  ),
  Empty: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="16" y1="3" x2="22" y2="7"></line>
      <line x1="8" y1="3" x2="2" y2="7"></line>
    </svg>
  )
};

const Earnings = () => {
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    withdrawn: 0,
    available: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');

  // Fetch earnings data
  const fetchEarningsData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [payoutsRes, bankAccountsRes, withdrawalRequestsRes, walletBalanceRes] = await Promise.all([
        payoutAPI.getPayouts({ page: 1, limit: 100 }),
        vendorAPI.getMyBankAccounts(),
        payoutAPI.getWithdrawalRequests().catch(() => ({ data: { success: true, data: { requests: [] } } })),
        walletAPI.getBalance().catch(() => ({ data: { success: true, data: { availableBalance: 0, lifetimeEarnings: 0, pendingBalance: 0 } } })),
      ]);

      const payouts =
        payoutsRes?.data?.data?.rows ||
        payoutsRes?.data?.data?.payouts ||
        payoutsRes?.data?.rows ||
        [];

      const accountList = Array.isArray(bankAccountsRes?.data?.data)
        ? bankAccountsRes.data.data
        : bankAccountsRes?.data?.data?.bankAccounts || bankAccountsRes?.data?.bankAccounts || [];

      const withdrawalRequests =
        withdrawalRequestsRes?.data?.data?.requests ||
        withdrawalRequestsRes?.data?.data?.rows ||
        [];

      const walletBalance = walletBalanceRes?.data?.data || {};
      const availableFromWallet = Number(walletBalance.availableBalance ?? 0);
      const lifetimeEarnings = Number(walletBalance.lifetimeEarnings ?? 0);

      const total = Number.isFinite(lifetimeEarnings)
        ? lifetimeEarnings
        : payouts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const withdrawn = payouts
        .filter((item) => ['processed', 'completed', 'withdrawn', 'paid'].includes(String(item.status || '').toLowerCase()))
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      const pendingFromTransactions = payouts
        .filter((item) => ['pending', 'requested', 'processing'].includes(String(item.status || '').toLowerCase()))
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      const pendingFromRequests = Array.isArray(withdrawalRequests)
        ? withdrawalRequests
            .filter((item) => ['pending', 'processing', 'approved'].includes(String(item.status || '').toLowerCase()))
            .reduce((sum, item) => sum + Number(item.requestedAmount || item.amount || 0), 0)
        : 0;
      const pending = pendingFromTransactions + pendingFromRequests;
      const thisMonth = payouts
        .filter((item) => {
          const createdAt = new Date(item.createdAt || item.created_at || Date.now());
          const now = new Date();
          return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
        })
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      setBankAccounts(accountList);
      setSelectedBankAccountId((prev) => {
        if (prev && accountList.some((account) => String(account.id) === String(prev))) {
          return String(prev);
        }

        const primaryAccount = accountList.find((account) => account.isPrimary) || accountList[0];
        return primaryAccount?.id ? String(primaryAccount.id) : '';
      });

      setEarnings({
        total,
        thisMonth,
        pending,
        withdrawn,
        available: Number.isFinite(availableFromWallet)
          ? availableFromWallet
          : Math.max(0, total - withdrawn - pending),
      });

      setTransactions(payouts);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError(err.message || 'Failed to load earnings. Please try again.');
      setEarnings({ total: 0, thisMonth: 0, pending: 0, withdrawn: 0, available: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  // Handle withdraw
  const handleWithdraw = async () => {
    const availableAmount = Number(earnings.available);

    if (!Number.isFinite(availableAmount)) {
      alert('Unable to withdraw because available balance is invalid. Please refresh and try again.');
      return;
    }

    if (!selectedBankAccountId) {
      alert('Please add and select a bank account before requesting a withdrawal');
      return;
    }

    if (availableAmount <= 0) {
      alert('No funds available for withdrawal');
      return;
    }

    if (availableAmount < 1000) {
      alert(`Minimum withdrawal amount is ₹1,000. You have ₹${availableAmount.toLocaleString('en-IN')} available.`);
      return;
    }

    const selectedBankAccount = bankAccounts.find(
      (account) => String(account.id) === String(selectedBankAccountId)
    );
    const bankLabel = selectedBankAccount
      ? `${selectedBankAccount.bankName || 'Bank account'} ending ${String(selectedBankAccount.accountNumber || '').slice(-4)}`
      : 'your selected bank account';

    const confirmed = await showConfirm(
      `Withdraw ₹${availableAmount.toLocaleString('en-IN')} to ${bankLabel}?`,
      'Confirm Withdrawal'
    );
    if (!confirmed) {
      return;
    }

    setWithdrawLoading(true);
    setError('');

    try {
      const response = await payoutAPI.createWithdrawalRequest({
        amount: availableAmount,
        requestedAmount: availableAmount,
        bankAccountId: Number(selectedBankAccountId),
        bankAccount: selectedBankAccount
          ? {
              id: selectedBankAccount.id,
              accountHolderName: selectedBankAccount.accountHolderName,
              accountNumber: selectedBankAccount.accountNumber,
              ifsc: selectedBankAccount.ifsc,
              bankName: selectedBankAccount.bankName,
              upiId: selectedBankAccount.upiId,
              isPrimary: selectedBankAccount.isPrimary,
            }
          : undefined,
      });

      if (response?.data?.success) {
        const requestId = response?.data?.data?.id;
        alert(requestId ? `Withdrawal request #${requestId} submitted successfully!` : 'Withdrawal request submitted successfully!');
        fetchEarningsData();
      } else {
        throw new Error(response?.data?.message || 'Withdrawal failed');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process withdrawal. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setWithdrawLoading(false);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatBankAccount = (account) => {
    const last4 = String(account?.accountNumber || '').slice(-4) || '----';
    const bankName = account?.bankName || 'Bank account';
    const ifsc = account?.ifsc ? ` • ${account.ifsc}` : '';

    return `${bankName} ••••${last4}${ifsc}`;
  };

  // Get status class
  const getStatusClass = (status) => {
    const statusMap = {
      'paid': 'status-paid',
      'pending': 'status-pending',
      'requested': 'status-pending',
      'processing': 'status-pending',
      'failed': 'status-failed',
      'withdrawn': 'status-withdrawn',
      'completed': 'status-completed',
      'processed': 'status-processed'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  // Loading state
  if (loading) {
    return (
      <div className="earnings-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading earnings data...</p>
          </div>
        </div>
      </div>
    );
  }

  const availableBalance = earnings.available;

  return (
    <div className="earnings-page">
      <div className="container">
        {/* Header - Title Left, Button Right */}
        <div className="page-header">
          <h1 className="page-title">Earnings</h1>
          <div className="header-right">
            <div className="date-filter">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="date-select"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchEarningsData} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="earnings-stats">
          <div className="stat-card stat-total">
            <div className="stat-icon">
              <Icons.Rupee />
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Earnings</span>
              <span className="stat-value">{formatCurrency(earnings.total)}</span>
            </div>
          </div>

          <div className="stat-card stat-month">
            <div className="stat-icon">
              <Icons.Calendar />
            </div>
            <div className="stat-details">
              <span className="stat-label">This Month</span>
              <span className="stat-value">{formatCurrency(earnings.thisMonth)}</span>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <Icons.Clock />
            </div>
            <div className="stat-details">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{formatCurrency(earnings.pending)}</span>
            </div>
          </div>

          <div className="stat-card stat-withdrawn">
            <div className="stat-icon">
              <Icons.CheckCircle />
            </div>
            <div className="stat-details">
              <span className="stat-label">Withdrawn</span>
              <span className="stat-value">{formatCurrency(earnings.withdrawn)}</span>
            </div>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="withdraw-section">
          <h2>Withdraw Earnings</h2>
          <div className="withdraw-card">
            <div className="balance-info">
              <span className="balance-label">Available Balance</span>
              <strong className="balance-amount">{formatCurrency(availableBalance)}</strong>
              <span className="balance-note">Minimum withdrawal: ₹1000</span>
            </div>

            <div className="withdraw-controls">
              {bankAccounts.length > 0 ? (
                <div className="bank-account-field">
                  <label htmlFor="withdraw-bank-account">Withdrawal Account</label>
                  <select
                    id="withdraw-bank-account"
                    value={selectedBankAccountId}
                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                    className="bank-account-select"
                  >
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={String(account.id)}>
                        {formatBankAccount(account)}{account.isPrimary ? ' (Primary)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bank-account-empty">
                  <p>Add a bank account from your KYC page to enable withdrawals.</p>
                  <button
                    type="button"
                    className="add-bank-btn"
                    onClick={() => navigate('/vendor/kyc')}
                  >
                    Add Bank Account
                  </button>
                </div>
              )}

              <button 
                className="withdraw-btn"
                onClick={handleWithdraw}
                disabled={withdrawLoading || availableBalance < 1000 || !selectedBankAccountId}
              >
                {withdrawLoading ? (
                  <>
                    <span className="spinner-small"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Icons.Withdraw />
                    Withdraw Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transactions-section">
          <div className="section-header">
            <h2>Transaction History</h2>
            {transactions.length > 0 && (
              <span className="transaction-count">
                {transactions.length} transactions
              </span>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <Icons.Empty />
              <h3>No transactions yet</h3>
              <p>Your earnings will appear here once you start getting bookings</p>
            </div>
          ) : (
            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Equipment</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id || transaction._id}>
                      <td>
                        <span className="transaction-date">
                          {formatDate(transaction.date || transaction.createdAt || transaction.created_at)}
                        </span>
                      </td>
                      <td>
                        <span className="equipment-name">
                          {transaction.equipment?.name || transaction.equipment || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="customer-name">
                          {transaction.customer?.name || transaction.customer || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="transaction-amount">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                          {transaction.status}
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

export default Earnings;