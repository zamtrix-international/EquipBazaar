import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { payoutAPI, vendorAPI } from '../../../services/api';
import { showConfirm, showSuccess, showError, showInfo } from '../../../utils/sweetalert';
import './PayoutApprovals.css';

const Icons = {
  Wallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 0 1 2-2h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V7z"></path>
      <path d="M16 13h4"></path>
      <circle cx="16" cy="13" r="1"></circle>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Refresh: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2"></path>
    </svg>
  ),
  Empty: () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2"></rect>
      <path d="M7 10h10M7 14h6"></path>
    </svg>
  ),
};

const PayoutApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [bankAccountsByVendor, setBankAccountsByVendor] = useState({});
  const [bankLoadingByVendor, setBankLoadingByVendor] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await payoutAPI.getWithdrawalRequests();
      const rows =
        response?.data?.data?.requests ||
        response?.data?.data?.rows ||
        response?.data?.data ||
        [];

      setRequests(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error('Error loading payout requests:', err);
      setRequests([]);
      setError(err.response?.data?.message || err.message || 'Failed to load payout requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const loadBankAccountsForRequest = useCallback(async (request) => {
    const vendorKey = String(request?.vendorId || '');

    if (!vendorKey || bankAccountsByVendor[vendorKey] || bankLoadingByVendor[vendorKey]) {
      return;
    }

    setBankLoadingByVendor((prev) => ({ ...prev, [vendorKey]: true }));

    try {
      const response = await vendorAPI.getProfile(vendorKey);
      const vendorData = response?.data?.data || response?.data || {};
      const bankAccounts = Array.isArray(vendorData?.bankAccounts) ? vendorData.bankAccounts : [];

      setBankAccountsByVendor((prev) => ({
        ...prev,
        [vendorKey]: bankAccounts,
      }));
    } catch (err) {
      console.error('Error loading vendor bank accounts:', err);
      setBankAccountsByVendor((prev) => ({
        ...prev,
        [vendorKey]: [],
      }));
      setError(err.response?.data?.message || err.message || 'Unable to load vendor bank details.');
    } finally {
      setBankLoadingByVendor((prev) => ({ ...prev, [vendorKey]: false }));
    }
  }, [bankAccountsByVendor, bankLoadingByVendor]);

  const getRequestBankAccounts = useCallback((request) => {
    const vendorKey = String(request?.vendorId || '');
    const bankAccounts = bankAccountsByVendor[vendorKey] || [];

    if (request?.bankAccount) {
      const selectedAccount = {
        ...request.bankAccount,
        id: request.bankAccount.id || request.bankAccountId || `request-${request.id}`,
      };

      const hasSelectedAccount = bankAccounts.some(
        (account) => String(account.id) === String(selectedAccount.id)
      );

      return hasSelectedAccount ? bankAccounts : [selectedAccount, ...bankAccounts];
    }

    return bankAccounts;
  }, [bankAccountsByVendor]);

  const handleToggleDetails = async (request) => {
    const nextId = String(selectedRequestId) === String(request.id) ? null : request.id;
    setSelectedRequestId(nextId);
    setError('');

    if (nextId) {
      await loadBankAccountsForRequest(request);
    }
  };

  const summary = useMemo(() => {
    const pending = requests.filter((request) => String(request.status || '').toUpperCase() === 'PENDING').length;
    const processing = requests.filter((request) => String(request.status || '').toUpperCase() === 'PROCESSING').length;
    const totalAmount = requests.reduce(
      (sum, request) => sum + Number(request.requestedAmount || request.amount || 0),
      0
    );

    return {
      total: requests.length,
      pending,
      processing,
      totalAmount,
    };
  }, [requests]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransferAccount = (request) => {
    const bankAccounts = getRequestBankAccounts(request);
    return (
      bankAccounts.find((account) => String(account.id) === String(request.bankAccountId)) ||
      bankAccounts.find((account) => account.isPrimary) ||
      bankAccounts[0] ||
      null
    );
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || '').toUpperCase();

    if (normalizedStatus === 'PENDING') return 'status-pending';
    if (['PROCESSING', 'APPROVED'].includes(normalizedStatus)) return 'status-processing';
    if (['PAID', 'COMPLETED', 'PROCESSED'].includes(normalizedStatus)) return 'status-paid';
    if (normalizedStatus === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  };

  const handleLookup = async (event) => {
    event.preventDefault();

    if (!requestId.trim()) {
      await showError('Please enter a payout request ID.', 'Validation Error');
      return;
    }

    setLookupLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await payoutAPI.getWithdrawalRequest(requestId.trim());
      const request = response?.data?.data || response?.data;

      if (request?.id) {
        await showSuccess(`Payout request #${request.id} loaded successfully!`, 'Success');
      } else {
        await showInfo('Payout request loaded successfully.', 'Information');
      }
      
      setRequestId('');
      await fetchRequests();
    } catch (err) {
      console.error('Payout lookup error:', err);
      await showError(
        err.response?.data?.message || err.message || 'Request not found.',
        'Lookup Failed'
      );
    } finally {
      setLookupLoading(false);
    }
  };

  // Updated handleProcess with SweetAlert
  const handleProcess = async (request) => {
    const requestAmount = Number(request?.requestedAmount || request?.amount || 0);
    const requestKey = request?.id;
    const transferAccount = getTransferAccount(request);

    if (!requestKey) {
      await showError('Invalid withdrawal request', 'Error');
      return;
    }

    if (!transferAccount) {
      await showError(
        'Bank account details are required before approval. Please ask vendor to add bank account.',
        'Bank Details Missing'
      );
      return;
    }

    const transferSummary = `${transferAccount.bankName || 'Bank'} | ${transferAccount.accountNumber || 'N/A'} | ${transferAccount.ifsc || 'N/A'}`;
    
    // Use SweetAlert confirmation instead of window.confirm
    const confirmed = await showConfirm(
      `Are you sure you want to process this payout?\n\n` +
      `Request #${requestKey}\n` +
      `Amount: ${formatCurrency(requestAmount)}\n` +
      `Transfer to: ${transferSummary}\n\n` +
      `This action cannot be undone.`,
      'Confirm Payout Approval'
    );
    
    if (!confirmed) {
      return;
    }

    setProcessingId(requestKey);
    setError('');
    setMessage('');

    try {
      const response = await payoutAPI.processWithdrawal(requestKey);
      const updatedRequest = response?.data?.data || {};

      setRequests((prev) =>
        prev.map((item) =>
          String(item.id) === String(requestKey)
            ? { ...item, ...updatedRequest, status: updatedRequest.status || 'PROCESSED' }
            : item
        )
      );

      await showSuccess(
        `Payout request #${requestKey} for ${formatCurrency(requestAmount)} has been processed successfully!`,
        'Payout Processed'
      );
      
      // Refresh the list after successful processing
      await fetchRequests();
    } catch (err) {
      console.error('Payout process error:', err);
      
      let errorMessage = 'Failed to process payout request.'
      
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 
                       'Invalid request. Please check:\n' +
                       '- Vendor bank account details are correct\n' +
                       '- Sufficient balance in admin wallet\n' +
                       '- Withdrawal request is still pending'
      } else if (err.response?.status === 404) {
        errorMessage = 'Withdrawal request not found. It may have been already processed.'
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to process withdrawals.'
      } else if (err.response?.status === 409) {
        errorMessage = 'This withdrawal has already been processed.'
      }
      
      await showError(errorMessage, 'Process Failed')
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="payout-approvals-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading payout requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payout-approvals-page">
      <div className="container">
        <div className="payout-header">
          <div>
            <h1>Payout Requests</h1>
            <p>Approve vendor withdrawal requests using the current backend payout flow.</p>
          </div>
          <button type="button" className="refresh-btn" onClick={fetchRequests}>
            <Icons.Refresh />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <span>✅</span>
            <p>{message}</p>
          </div>
        )}

        <div className="info-banner">
          <strong>Approval flow:</strong> Open a payout request, verify the vendor bank details, then click "Approve Payout" to process the withdrawal.
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon total">
              <Icons.Wallet />
            </div>
            <div>
              <span className="summary-label">Tracked Requests</span>
              <strong className="summary-value">{summary.total}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon pending">
              <Icons.Clock />
            </div>
            <div>
              <span className="summary-label">Pending Review</span>
              <strong className="summary-value">{summary.pending}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon processing">
              <Icons.Refresh />
            </div>
            <div>
              <span className="summary-label">Processing</span>
              <strong className="summary-value">{summary.processing}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon amount">
              <Icons.Wallet />
            </div>
            <div>
              <span className="summary-label">Total Requested</span>
              <strong className="summary-value">{formatCurrency(summary.totalAmount)}</strong>
            </div>
          </div>
        </div>

        <div className="lookup-card">
          <div>
            <h2>Find a payout request</h2>
            <p>Enter the withdrawal request ID returned when the vendor submitted the request.</p>
          </div>

          <form className="lookup-form" onSubmit={handleLookup}>
            <input
              type="text"
              value={requestId}
              onChange={(event) => setRequestId(event.target.value)}
              className="lookup-input"
              placeholder="Enter payout request ID"
            />
            <button type="submit" className="lookup-btn" disabled={lookupLoading}>
              {lookupLoading ? 'Loading...' : <><Icons.Search /><span>Fetch Request</span></>}
            </button>
          </form>
        </div>

        <div className="requests-card">
          <div className="card-header">
            <h2>Payout approval queue</h2>
            <span>{requests.length} request{requests.length === 1 ? '' : 's'}</span>
          </div>

          {requests.length === 0 ? (
            <div className="empty-state">
              <Icons.Empty />
              <h3>No payout requests loaded yet</h3>
              <p>As soon as a vendor submits a withdrawal request through the app, it will appear here for admin review.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Vendor ID</th>
                    <th>Requested Amount</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const isPending = String(request.status || '').toUpperCase() === 'PENDING';
                    const isExpanded = String(selectedRequestId) === String(request.id);
                    const vendorKey = String(request.vendorId || '');
                    const bankAccounts = getRequestBankAccounts(request);
                    const transferAccount = getTransferAccount(request);
                    const bankDetailsAvailable = bankAccounts.length > 0;

                    return (
                      <Fragment key={request.id}>
                        <tr className={isExpanded ? 'expanded-row' : ''}>
                          <td className="mono-text">#{request.id}</td>
                          <td>{request.vendorId || 'N/A'}</td>
                          <td className="amount-cell">{formatCurrency(request.requestedAmount || request.amount)}</td>
                          <td>{formatDate(request.requestedAt || request.createdAt)}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(request.status)}`}>
                              {String(request.status || 'PENDING').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                className="details-btn"
                                onClick={() => handleToggleDetails(request)}
                              >
                                {isExpanded ? 'Hide Bank Details' : 'View Bank Details'}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="details-row">
                            <td colSpan="6">
                              <div className="bank-details-panel">
                                <div className="bank-details-header">
                                  <div>
                                    <h3>Vendor bank account details</h3>
                                    <p>
                                      {request.bankAccountId
                                        ? 'The selected withdrawal account is highlighted below.'
                                        : 'Showing the vendor\'s current bank accounts from the backend profile.'}
                                    </p>
                                  </div>

                                  {isPending && (
                                    <button
                                      type="button"
                                      className="approve-btn detail-approve-btn"
                                      onClick={() => handleProcess(request)}
                                      disabled={processingId === request.id || !bankDetailsAvailable}
                                    >
                                      {processingId === request.id ? (
                                        'Processing...'
                                      ) : (
                                        <>
                                          <Icons.Check />
                                          <span>Approve Payout</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {bankLoadingByVendor[vendorKey] ? (
                                  <div className="details-empty">
                                    <p>Loading vendor bank account details...</p>
                                  </div>
                                ) : bankAccounts.length > 0 ? (
                                  <>
                                    <div className="bank-accounts-grid">
                                      {bankAccounts.map((account, index) => {
                                        const isSelectedAccount =
                                          String(account.id) === String(request.bankAccountId) ||
                                          (!request.bankAccountId && account.isPrimary && index === 0);

                                        return (
                                          <div
                                            key={`${request.id}-${account.id || index}`}
                                            className={`bank-account-card ${isSelectedAccount ? 'selected' : ''}`}
                                          >
                                            <div className="bank-account-top">
                                              <strong>{account.bankName || 'Bank Account'}</strong>
                                              <div className="bank-badges">
                                                {account.isPrimary && <span className="mini-badge">Primary</span>}
                                                {isSelectedAccount && (
                                                  <span className="mini-badge selected">Transfer here</span>
                                                )}
                                              </div>
                                            </div>

                                            <div className="bank-fields">
                                              <div className="bank-field">
                                                <span>Account Holder</span>
                                                <strong>{account.accountHolderName || 'N/A'}</strong>
                                              </div>
                                              <div className="bank-field">
                                                <span>Account Number</span>
                                                <strong>{account.accountNumber || 'N/A'}</strong>
                                              </div>
                                              <div className="bank-field">
                                                <span>IFSC</span>
                                                <strong>{account.ifsc || 'N/A'}</strong>
                                              </div>
                                              <div className="bank-field">
                                                <span>UPI ID</span>
                                                <strong>{account.upiId || '—'}</strong>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {transferAccount && (
                                      <p className="details-note">
                                        <strong>Recommended transfer account:</strong> {transferAccount.accountHolderName || 'N/A'} • {transferAccount.bankName || 'Bank'} • {transferAccount.accountNumber || 'N/A'} • {transferAccount.ifsc || 'N/A'}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <div className="details-empty">
                                    <p>No bank account details were found for this vendor. Please ask the vendor to update KYC before approving the payout.</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayoutApprovals;