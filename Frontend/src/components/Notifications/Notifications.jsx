import { useState, useEffect } from 'react'
import { notificationAPI } from '../../services/api'
import './Notifications.css'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getMyNotifications()
      const notifs = response.data.notifications || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Fallback to mock data
      const mockNotifications = [
        {
          id: 1,
          title: 'Booking Confirmed',
          message: 'Your JCB booking has been confirmed for tomorrow.',
          type: 'booking',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/customer/bookings'
        },
        {
          id: 2,
          title: 'Payment Received',
          message: 'Payment of ₹2,400 has been received for your booking.',
          type: 'payment',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          actionUrl: '/customer/bookings'
        },
        {
          id: 3,
          title: 'Equipment Delivered',
          message: 'Your tractor has been delivered to the site.',
          type: 'delivery',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          actionUrl: '/customer/bookings'
        }
      ]
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.read).length)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications(notifications.map(notif => ({ ...notif, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return 'fas fa-calendar-check'
      case 'payment': return 'fas fa-credit-card'
      case 'delivery': return 'fas fa-truck'
      case 'support': return 'fas fa-headset'
      case 'system': return 'fas fa-info-circle'
      default: return 'fas fa-bell'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking': return '#28a745'
      case 'payment': return '#007bff'
      case 'delivery': return '#ffc107'
      case 'support': return '#dc3545'
      case 'system': return '#6c757d'
      default: return '#007bff'
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="notifications">
        <button className="notification-btn loading">
          <i className="fas fa-bell"></i>
        </button>
      </div>
    )
  }

  return (
    <div className="notifications">
      <button
        className="notification-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl
                    }
                  }}
                >
                  <div
                    className="notification-icon"
                    style={{ color: getNotificationColor(notification.type) }}
                  >
                    <i className={getNotificationIcon(notification.type)}></i>
                  </div>

                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>

                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="dropdown-footer">
              <button className="view-all-btn">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="notification-overlay"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  )
}

export default Notifications