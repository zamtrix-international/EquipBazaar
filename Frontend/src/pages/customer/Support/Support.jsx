// pages/customer/Support/Support.jsx
import { useState, useEffect } from 'react';
import { supportAPI } from '../../../services/api';
import './Support.css';

// Icon Components
const Icons = {
  Ticket: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
      <line x1="8" y1="8" x2="16" y2="8"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
      <line x1="8" y1="16" x2="12" y2="16"></line>
    </svg>
  ),
  NewTicket: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  )
};

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'booking',
    priority: 'medium',
    message: ''
  });
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await supportAPI.getMyTickets();
      
      if (response?.data?.success) {
        const ticketsData = response.data.data?.tickets || response.data.data?.rows || response.data.data || [];
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load tickets. Please try again.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Create new ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await supportAPI.createTicket(newTicket);
      
      if (response?.data?.success) {
        setTickets([response.data.data.ticket, ...tickets]);
        setNewTicket({
          subject: '',
          category: 'booking',
          priority: 'medium',
          message: ''
        });
        setShowNewTicketForm(false);
        alert('Support ticket created successfully!');
      } else {
        throw new Error(response?.data?.message || 'Failed to create ticket');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Send message
  const handleSendMessage = async (ticketId) => {
    if (!newMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await supportAPI.sendMessage(ticketId, { message: newMessage });
      
      if (response?.data?.success) {
        setNewMessage('');
        await fetchTickets(); // Refresh tickets
      } else {
        throw new Error(response?.data?.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err?.response?.data?.message || err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;

    setSubmitting(true);
    try {
      const response = await supportAPI.closeTicket(ticketId);
      
      if (response?.data?.success) {
        await fetchTickets(); // Refresh tickets
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
      } else {
        throw new Error(response?.data?.message || 'Failed to close ticket');
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert(err?.response?.data?.message || err.message || 'Failed to close ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'var(--yellow-primary)';
      case 'pending': return 'var(--yellow-dark)';
      case 'closed': return 'var(--black-lighter)';
      default: return 'var(--black-lighter)';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'var(--yellow-light)';
      case 'medium': return 'var(--yellow-primary)';
      case 'high': return 'var(--yellow-dark)';
      case 'urgent': return 'var(--yellow-dark)';
      default: return 'var(--yellow-light)';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="support-page">
        <div className="container">
          <div className="loading-state">
            <Icons.Spinner />
            <p>Loading support tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      <div className="container">
        {/* Header */}
        <div className="support-header">
          <div className="header-left">
            <h1 className="page-title">Support Center</h1>
            <p className="page-subtitle">We're here to help you</p>
          </div>
          <button
            className="new-ticket-btn"
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          >
            <Icons.NewTicket />
            <span>{showNewTicketForm ? 'Cancel' : 'New Support Ticket'}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <Icons.AlertCircle />
            <span>{error}</span>
            <button onClick={fetchTickets} className="retry-btn">Retry</button>
          </div>
        )}

        {/* New Ticket Form */}
        {showNewTicketForm && (
          <form className="new-ticket-form" onSubmit={handleCreateTicket}>
            <h3>Create New Support Ticket</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Subject <span className="required">*</span></label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="equipment">Equipment Problem</option>
                  <option value="vendor">Vendor Issue</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority <span className="required">*</span></label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Message <span className="required">*</span></label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows="5"
                required
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={submitting} 
                className="submit-btn"
              >
                {submitting ? (
                  <>
                    <Icons.Spinner />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tickets List */}
        <div className="tickets-section">
          <h2>Your Support Tickets</h2>

          {tickets.length === 0 ? (
            <div className="no-tickets">
              <Icons.Ticket />
              <h3>No tickets found</h3>
              <p>You haven't created any support tickets yet.</p>
              <button
                className="new-ticket-btn"
                onClick={() => setShowNewTicketForm(true)}
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`ticket-card ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
                >
                  {/* Ticket Header */}
                  <div 
                    className="ticket-header"
                    onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                  >
                    <div className="ticket-info">
                      <h4>{ticket.subject}</h4>
                      <div className="ticket-meta">
                        <span className="ticket-id">#{ticket.id}</span>
                        <span className="ticket-category">{ticket.category}</span>
                        <span
                          className="ticket-priority"
                          style={{ 
                            background: getPriorityColor(ticket.priority),
                            color: ticket.priority === 'low' ? 'var(--black-primary)' : 'white'
                          }}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-status">
                      <span
                        className="status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(ticket.status),
                          color: ticket.status === 'closed' ? 'white' : 'var(--black-primary)'
                        }}
                      >
                        {ticket.status}
                      </span>
                      <span className="ticket-date">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  {selectedTicket?.id === ticket.id && (
                    <div className="ticket-details">
                      <div className="messages">
                        {ticket.messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`message ${message.sender === 'customer' ? 'customer' : 'support'}`}
                          >
                            <div className="message-content">
                              <p>{message.message}</p>
                              <span className="message-time">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {ticket.status !== 'closed' && (
                        <div className="reply-form">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your reply..."
                            rows="3"
                            className="reply-input"
                          />
                          <div className="reply-actions">
                            <button
                              onClick={() => handleCloseTicket(ticket.id)}
                              className="close-ticket-btn"
                              title="Close Ticket"
                            >
                              <Icons.Close />
                              <span>Close</span>
                            </button>
                            <button
                              onClick={() => handleSendMessage(ticket.id)}
                              disabled={!newMessage.trim()}
                              className="send-btn"
                            >
                              <Icons.Send />
                              <span>Send Reply</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {ticket.status === 'closed' && (
                        <div className="closed-ticket-message">
                          <p>This ticket is closed. You cannot reply anymore.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;