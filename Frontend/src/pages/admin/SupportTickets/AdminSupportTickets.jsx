// pages/admin/SupportTickets/AdminSupportTickets.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../services/api';
import { showConfirm, showSuccess, showError } from '../../../utils/sweetalert';
import './AdminSupportTickets.css';

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch support tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await adminAPI.getAllSupportTickets(params);
      
      if (response?.data?.success) {
        let ticketData = response.data.data;
        const rows = ticketData?.rows || ticketData?.tickets || [];
        const total = ticketData?.total || ticketData?.count || rows.length;
        
        setTickets(rows);
        setPagination(prev => ({
          ...prev,
          total: total,
          pages: Math.ceil(total / prev.limit)
        }));
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load support tickets.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTickets();
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // View ticket details
  const handleViewTicket = async (ticket) => {
    try {
      setProcessingId(ticket.id);
      const response = await adminAPI.getSupportTicketDetails(ticket.id);
      
      if (response?.data?.success) {
        setSelectedTicket(response.data.data);
        setShowDetailModal(true);
      } else {
        throw new Error(response?.data?.message || 'Failed to load ticket details');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Failed to load ticket details.');
    } finally {
      setProcessingId(null);
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId, reason = '') => {
    const confirmed = await showConfirm(
      'Are you sure you want to close this support ticket?',
      'Close Support Ticket'
    );
    if (!confirmed) return;

    try {
      setProcessingId(ticketId);
      await adminAPI.closeSupportTicket(ticketId, { reason });

      await fetchTickets();
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
        setShowDetailModal(false);
      }

      showToast('Support ticket closed successfully!', 'success');
    } catch (err) {
      console.error('Error closing ticket:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to close support ticket.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Send message to ticket
  const handleSendMessage = async (ticketId, message) => {
    if (!message.trim()) return;

    try {
      setProcessingId(`message-${ticketId}`);
      const response = await adminAPI.addSupportTicketMessage(ticketId, { message });
      
      if (response?.data?.success) {
        const newMessage = response.data.data;
        
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => ({
            ...prev,
            messages: [...(prev.messages || []), newMessage],
            updatedAt: new Date().toISOString()
          }));
        }
        
        await fetchTickets();
        showToast('Message sent successfully!', 'success');
        return true;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to send message.', 'error');
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'OPEN': { class: 'status-open', text: 'Open' },
      'IN_PROGRESS': { class: 'status-progress', text: 'In Progress' },
      'RESOLVED': { class: 'status-resolved', text: 'Resolved' },
      'CLOSED': { class: 'status-closed', text: 'Closed' }
    };
    const config = statusConfig[status] || statusConfig['OPEN'];
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'LOW': { class: 'priority-low', text: 'Low' },
      'MEDIUM': { class: 'priority-medium', text: 'Medium' },
      'HIGH': { class: 'priority-high', text: 'High' },
      'URGENT': { class: 'priority-urgent', text: 'Urgent' }
    };
    const config = priorityConfig[priority] || priorityConfig['MEDIUM'];
    return <span className={`priority-badge ${config.class}`}>{config.text}</span>;
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const categories = {
      'PAYMENT': 'Payment',
      'BOOKING': 'Booking',
      'DELIVERY': 'Delivery',
      'KYC': 'KYC',
      'TECH': 'Technical',
      'OTHER': 'Other'
    };
    return categories[category] || category;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="admin-support-tickets">
        <div className="container">
          <div className="loader">
            <div className="spinner"></div>
            <p>Loading support tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-support-tickets">
      <div className="container">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="support-header">
          <h1>Support Tickets</h1>
          <p>Manage customer and vendor support tickets</p>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tickets by subject, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn-search">Search</button>
          </form>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Tickets
              {pagination.total > 0 && <span className="count">{pagination.total}</span>}
            </button>
            <button
              className={`filter-tab ${statusFilter === 'OPEN' ? 'active' : ''}`}
              onClick={() => handleFilterChange('OPEN')}
            >
              Open
            </button>
            <button
              className={`filter-tab ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => handleFilterChange('IN_PROGRESS')}
            >
              In Progress
            </button>
            <button
              className={`filter-tab ${statusFilter === 'CLOSED' ? 'active' : ''}`}
              onClick={() => handleFilterChange('CLOSED')}
            >
              Closed
            </button>
          </div>

          <button onClick={fetchTickets} className="btn-refresh" title="Refresh">
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setError('')} className="alert-close">×</button>
          </div>
        )}

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No support tickets found</h3>
            <p>There are no support tickets matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-info">
                      <h3 className="ticket-subject">{ticket.subject}</h3>
                      <div className="ticket-meta">
                        <span className="ticket-id">#{ticket.id}</span>
                        <span className="ticket-category">{getCategoryLabel(ticket.category)}</span>
                        <span className="ticket-creator">
                          {ticket.User?.name || ticket.createdByUser?.name || 'Unknown'}
                        </span>
                        <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ticket-badges">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>

                  <div className="ticket-content">
                    <p className="ticket-description">
                      {ticket.description || ticket.messages?.[0]?.message || 'No description provided.'}
                    </p>
                  </div>

                  <div className="ticket-footer">
                    <div className="ticket-stats">
                      <span className="messages-count">
                        💬 {ticket.messages?.length || 0} messages
                      </span>
                    </div>
                    <div className="ticket-actions">
                      <button
                        className="btn-view"
                        onClick={() => handleViewTicket(ticket)}
                        disabled={processingId === ticket.id}
                      >
                        👁️ View Details
                      </button>

                      {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                        <button
                          className="btn-close"
                          onClick={() => handleCloseTicket(ticket.id)}
                          disabled={processingId === ticket.id}
                        >
                          🔒 Close Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  ← Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTicket(null);
          }}
          onSendMessage={handleSendMessage}
          onCloseTicket={handleCloseTicket}
          processingId={processingId}
        />
      )}
    </div>
  );
};

// Ticket Detail Modal Component
const TicketDetailModal = ({ ticket, onClose, onSendMessage, onCloseTicket, processingId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    const success = await onSendMessage(ticket.id, newMessage);
    if (success) {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'Open';
      case 'IN_PROGRESS': return 'In Progress';
      case 'RESOLVED': return 'Resolved';
      case 'CLOSED': return 'Closed';
      default: return status || 'Open';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ticket #{ticket.id}: {ticket.subject}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Ticket Info */}
          <div className="ticket-info-section">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Status:</span>
                <span className={`value status-${ticket.status?.toLowerCase()}`}>
                  {getStatusText(ticket.status)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Priority:</span>
                <span className={`value priority-${ticket.priority?.toLowerCase()}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Category:</span>
                <span className="value">{ticket.category}</span>
              </div>
              <div className="info-item">
                <span className="label">Created by:</span>
                <span className="value">
                  {ticket.User?.name || ticket.createdByUser?.name || 'Unknown'}
                  <span className="role-badge">({ticket.role?.toLowerCase() || 'user'})</span>
                </span>
              </div>
              <div className="info-item">
                <span className="label">Created:</span>
                <span className="value">{formatDate(ticket.createdAt)}</span>
              </div>
              {ticket.closedAt && (
                <div className="info-item">
                  <span className="label">Closed:</span>
                  <span className="value">{formatDate(ticket.closedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="messages-section">
            <h3>Messages ({ticket.messages?.length || 0})</h3>
            <div className="messages-list">
              {(ticket.messages || []).map((message, index) => (
                <div key={message.id || index} className="message-item">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.senderUserId === ticket.createdByUserId ? 
                        (ticket.User?.name || ticket.createdByUser?.name || 'Customer') : 
                        'Support Team'}
                    </span>
                    <span className="message-time">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Section */}
          {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
            <div className="reply-section">
              <h3>Reply to Ticket</h3>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your reply..."
                rows={4}
                disabled={sending || processingId === `message-${ticket.id}`}
              />
              <div className="reply-actions">
                <button
                  className="btn-send"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending || processingId === `message-${ticket.id}`}
                >
                  {sending || processingId === `message-${ticket.id}` ? 'Sending...' : '📤 Send Reply'}
                </button>
                <button
                  className="btn-close-ticket"
                  onClick={() => onCloseTicket(ticket.id)}
                  disabled={processingId === ticket.id}
                >
                  🔒 Close Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportTickets;