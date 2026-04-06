// pages/admin/SupportTickets/AdminSupportTickets.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../services/api';
import './AdminSupportTickets.css';

// Icon Components
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Support: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Message: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  )
};

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch support tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: filter !== 'all' ? filter : undefined
      };

      const response = await adminAPI.getAllSupportTickets(params);
      const ticketData = response?.data?.data || {};

      setTickets(ticketData.rows || ticketData.tickets || []);
      setPagination(prev => ({
        ...prev,
        total: ticketData.total || ticketData.count || 0,
        pages: ticketData.pages || Math.ceil((ticketData.total || ticketData.count || 0) / prev.limit)
      }));
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError('Failed to load support tickets. Please try again.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Handle ticket status filter
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
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
      const ticketDetails = response?.data?.data || ticket;

      setSelectedTicket(ticketDetails);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Failed to load ticket details.');
    } finally {
      setProcessingId(null);
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId, reason = '') => {
    if (!window.confirm('Are you sure you want to close this support ticket?')) {
      return;
    }

    try {
      setProcessingId(ticketId);
      await adminAPI.closeSupportTicket(ticketId, { reason });

      // Update local state
      setTickets(prev => prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: 'CLOSED', closedAt: new Date().toISOString() }
          : ticket
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: 'CLOSED', closedAt: new Date().toISOString() }));
      }

      alert('Support ticket closed successfully.');
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert('Failed to close support ticket. Please try again.');
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

      const newMessage = response?.data?.data || {
        id: Date.now(),
        message,
        senderUserId: null, // Admin
        createdAt: new Date().toISOString(),
        sender: { name: 'Admin', role: 'ADMIN' }
      };

      // Update local state
      setTickets(prev => prev.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              messages: [...(ticket.messages || []), newMessage],
              updatedAt: new Date().toISOString()
            }
          : ticket
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMessage],
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'OPEN': { class: 'status-open', icon: <Icons.AlertCircle />, text: 'Open' },
      'IN_PROGRESS': { class: 'status-progress', icon: <Icons.Clock />, text: 'In Progress' },
      'CLOSED': { class: 'status-closed', icon: <Icons.CheckCircle />, text: 'Closed' },
      'RESOLVED': { class: 'status-resolved', icon: <Icons.CheckCircle />, text: 'Resolved' }
    };

    const config = statusConfig[status] || statusConfig['OPEN'];
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon}
        {config.text}
      </span>
    );
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

  if (loading && tickets.length === 0) {
    return (
      <div className="admin-support-tickets">
        <div className="loading-container">
          <Icons.Spinner />
          <p>Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-support-tickets">
      <div className="header">
        <div className="header-content">
          <div className="header-icon">
            <Icons.Support />
          </div>
          <div className="header-text">
            <h1>Support Tickets</h1>
            <p>Manage customer and vendor support tickets</p>
          </div>
        </div>
      </div>

      <div className="content">
        {/* Filters and Search */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search tickets by subject, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">Search</button>
          </form>

          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All Tickets' },
              { key: 'OPEN', label: 'Open' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'CLOSED', label: 'Closed' }
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`filter-tab ${filter === key ? 'active' : ''}`}
                onClick={() => handleFilterChange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <Icons.AlertCircle />
            <span>{error}</span>
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}

        {/* Tickets List */}
        <div className="tickets-list">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <Icons.Support />
              <h3>No support tickets found</h3>
              <p>There are no support tickets matching your criteria.</p>
            </div>
          ) : (
            <>
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-info">
                      <h3 className="ticket-subject">{ticket.subject}</h3>
                      <div className="ticket-meta">
                        <span className="ticket-id">#{ticket.id}</span>
                        <span className="ticket-creator">
                          {ticket.creator?.name || ticket.creator?.email || 'Unknown User'}
                        </span>
                        <span className="ticket-role">
                          ({String(ticket.creator?.role || ticket.role || '').toLowerCase()})
                        </span>
                        <span className="ticket-date">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-status">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>

                  <div className="ticket-content">
                    <p className="ticket-description">
                      {ticket.description || ticket.messages?.[0]?.message || 'No description'}
                    </p>
                  </div>

                  <div className="ticket-actions">
                    <button
                      className="btn-view"
                      onClick={() => handleViewTicket(ticket)}
                      disabled={processingId === ticket.id}
                    >
                      <Icons.Eye />
                      View Details
                    </button>

                    {ticket.status !== 'CLOSED' && (
                      <button
                        className="btn-close"
                        onClick={() => handleCloseTicket(ticket.id)}
                        disabled={processingId === ticket.id}
                      >
                        <Icons.Close />
                        Close Ticket
                      </button>
                    )}

                    <div className="ticket-stats">
                      <span className="messages-count">
                        <Icons.Message />
                        {ticket.messages?.length || 0} messages
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </button>

                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await onSendMessage(ticket.id, newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ticket #{ticket.id}: {ticket.subject}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="ticket-info-section">
            <div className="info-row">
              <span className="label">Status:</span>
              <span className="value">{ticket.status}</span>
            </div>
            <div className="info-row">
              <span className="label">Priority:</span>
              <span className="value">{ticket.priority}</span>
            </div>
            <div className="info-row">
              <span className="label">Category:</span>
              <span className="value">{ticket.category}</span>
            </div>
            <div className="info-row">
              <span className="label">Created by:</span>
              <span className="value">
                {ticket.creator?.name || ticket.creator?.email || 'Unknown'} ({ticket.creator?.role || 'USER'})
              </span>
            </div>
            <div className="info-row">
              <span className="label">Created:</span>
              <span className="value">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            {ticket.closedAt && (
              <div className="info-row">
                <span className="label">Closed:</span>
                <span className="value">{new Date(ticket.closedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="messages-section">
            <h3>Messages</h3>
            <div className="messages-list">
              {(ticket.messages || []).map((message) => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.sender?.name || message.sender?.email || 'Unknown'}
                      {message.sender?.role && ` (${message.sender.role})`}
                    </span>
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {ticket.status !== 'CLOSED' && (
            <div className="reply-section">
              <h3>Reply to Ticket</h3>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your reply..."
                rows={4}
                disabled={processingId === `message-${ticket.id}`}
              />
              <div className="reply-actions">
                <button
                  className="btn-send"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || processingId === `message-${ticket.id}`}
                >
                  {processingId === `message-${ticket.id}` ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  className="btn-close-ticket"
                  onClick={() => onCloseTicket(ticket.id)}
                  disabled={processingId === ticket.id}
                >
                  Close Ticket
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