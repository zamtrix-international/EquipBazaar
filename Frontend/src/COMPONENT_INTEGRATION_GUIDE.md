# Component Integration Guide

## How to Update Existing Pages with New Components

This guide shows step-by-step examples of how to refactor existing pages to use the new component system.

---

## 1. Converting to Card Component

### Before
```jsx
<div className="booking-card">
  <div className="booking-header">
    <h3>{booking.equipment.name}</h3>
    <p className="booking-vendor">{booking.vendor.name}</p>
  </div>
  <div className="booking-body">
    <p>{booking.equipment.description}</p>
  </div>
  <div className="booking-footer">
    <button onClick={handleView}>View Details</button>
  </div>
</div>
```

### After
```jsx
import Card, { CardHeader, CardBody, CardFooter, CardTitle, CardSubtitle } from '../components/Card/Card';

<Card elevation="md" hover={true}>
  <CardHeader>
    <CardTitle>{booking.equipment.name}</CardTitle>
    <CardSubtitle>{booking.vendor.name}</CardSubtitle>
  </CardHeader>
  <CardBody>
    <p>{booking.equipment.description}</p>
  </CardBody>
  <CardFooter>
    <button className="btn btn-primary" onClick={handleView}>View Details</button>
  </CardFooter>
</Card>
```

---

## 2. Adding Image with Fallback

### Before
```jsx
<img 
  src={booking.equipment.image} 
  alt="Equipment" 
  className="equipment-image" 
/>
```

### After
```jsx
import { getEquipmentImage } from '../utils/imageUtils';

<img 
  src={getEquipmentImage(booking.equipment)} 
  alt="Equipment" 
  className="equipment-image"
  onError={(e) => e.target.style.display = 'none'}
/>
```

---

## 3. Replacing window.confirm()

### Before
```jsx
const handleDelete = () => {
  if (window.confirm('Are you sure?')) {
    api.deleteBooking(id);
  }
};
```

### After
```jsx
import { showConfirm, showSuccess, showError } from '../utils/sweetalert';

const handleDelete = async () => {
  const confirmed = await showConfirm(
    'This action cannot be undone.',
    'Delete Booking?'
  );
  
  if (confirmed) {
    try {
      showLoading('Deleting...');
      await api.deleteBooking(id);
      closeLoading();
      showSuccess('Booking deleted successfully');
      navigate('/bookings');
    } catch (error) {
      closeLoading();
      showError(error.message);
    }
  }
};
```

---

## 4. Adding Empty State

### Before
```jsx
<div className="bookings-list">
  {bookings.length === 0 && (
    <p className="no-data">You haven't made any bookings yet.</p>
  )}
  {bookings.map(booking => (
    <BookingCard key={booking.id} booking={booking} />
  ))}
</div>
```

### After
```jsx
import EmptyState from '../components/EmptyState/EmptyState';

<div className="bookings-list">
  {bookings.length === 0 ? (
    <EmptyState 
      icon="📭"
      title="No Bookings Yet"
      message="Start exploring equipment and make your first booking!"
      action={() => navigate('/equipment')}
      actionLabel="Browse Equipment"
    />
  ) : (
    bookings.map(booking => (
      <BookingCard key={booking.id} booking={booking} />
    ))
  )}
</div>
```

---

## 5. Adding Loading State

### Before
```jsx
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  api.getBookings()
    .then(data => {
      setBookings(data);
      setLoading(false);
    });
}, []);

return (
  <div>
    {loading && <div className="spinner"></div>}
    {!loading && <BookingsList bookings={bookings} />}
  </div>
);
```

### After
```jsx
import Loader from '../components/Loader/Loader';

const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  api.getBookings()
    .then(data => {
      setBookings(data);
      setLoading(false);
    });
}, []);

return (
  <div>
    {loading ? (
      <Loader message="Loading your bookings..." size="medium" />
    ) : (
      <BookingsList bookings={bookings} />
    )}
  </div>
);
```

---

## 6. Status Badges

### Before
```jsx
<span className={`status status-${booking.status.toLowerCase()}`}>
  {booking.status}
</span>
```

### After
```jsx
import { BadgeSuccess, BadgeDanger, BadgePrimary } from '../components/Badge/Badge';

const getStatusBadge = (status) => {
  const statusMap = {
    'COMPLETED': <BadgeSuccess pill={true}>{status}</BadgeSuccess>,
    'CANCELLED': <BadgeDanger pill={true}>{status}</BadgeDanger>,
    'PENDING': <BadgePrimary pill={true}>{status}</BadgePrimary>,
  };
  return statusMap[status] || <span className="badge">{status}</span>;
};

{getStatusBadge(booking.status)}
```

---

## 7. Complete Page Example: MyBookings

### Refactored MyBookings.jsx
```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import EmptyState from '../components/EmptyState/EmptyState';
import Card, { CardHeader, CardBody, CardFooter, CardTitle, CardSubtitle, CardImage } from '../components/Card/Card';
import { BadgeSuccess, BadgeDanger } from '../components/Badge/Badge';
import { getEquipmentImage } from '../utils/imageUtils';
import { showConfirm, showSuccess, showError, showLoading, closeLoading } from '../utils/sweetalert';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to cancel this booking?',
      'Cancel Booking?'
    );

    if (confirmed) {
      try {
        showLoading('Cancelling booking...');
        await api.cancelBooking(bookingId);
        closeLoading();
        showSuccess('Booking cancelled successfully');
        setBookings(bookings.filter(b => b.id !== bookingId));
      } catch (error) {
        closeLoading();
        showError(error.message);
      }
    }
  };

  const handleApproveReturn = async (bookingId) => {
    const confirmed = await showConfirm(
      'Confirm that you have received the equipment back?',
      'Approve Return?'
    );

    if (confirmed) {
      try {
        showLoading('Processing return...');
        await api.approveReturn(bookingId);
        closeLoading();
        showSuccess('Return approved successfully');
        fetchBookings();
      } catch (error) {
        closeLoading();
        showError(error.message);
      }
    }
  };

  if (loading) {
    return <Loader message="Loading your bookings..." size="medium" />;
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No Bookings Yet"
        message="You haven't made any bookings yet. Start exploring!"
        action={() => navigate('/equipment')}
        actionLabel="Browse Equipment"
      />
    );
  }

  return (
    <div className="my-bookings-container">
      <h1>My Bookings</h1>
      
      <div className="grid grid-2">
        {bookings.map((booking) => (
          <Card key={booking.id} elevation="md" hover={true}>
            <CardImage
              src={getEquipmentImage(booking.equipment)}
              alt={booking.equipment.name}
            />
            <CardHeader>
              <CardTitle>{booking.equipment.name}</CardTitle>
              <CardSubtitle>{booking.vendor.name}</CardSubtitle>
            </CardHeader>
            
            <CardBody>
              <p>
                <strong>Status:</strong>{' '}
                {booking.status === 'COMPLETED' ? (
                  <BadgeSuccess pill={true}>{booking.status}</BadgeSuccess>
                ) : (
                  <BadgeDanger pill={true}>{booking.status}</BadgeDanger>
                )}
              </p>
              <p>
                <strong>Location:</strong> {booking.equipment.location}
              </p>
              <p>
                <strong>Duration:</strong> {booking.duration} days
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{booking.totalAmount}
              </p>
            </CardBody>
            
            <CardFooter>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/booking/${booking.id}`)}
              >
                View Details
              </button>
              
              {booking.status === 'DELIVERED' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleApproveReturn(booking.id)}
                >
                  Confirm Return
                </button>
              )}
              
              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Cancel
                </button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;
```

---

## 8. CSS Classes Quick Reference

### Spacing
```css
.mt-1 .mt-2 .mt-3 .mt-4 .mt-5 /* Margin Top */
.mb-1 .mb-2 .mb-3 .mb-4 .mb-5 /* Margin Bottom */
.ml-1 .ml-2 .ml-3 .ml-4 .ml-5 /* Margin Left */
.mr-1 .mr-2 .mr-3 .mr-4 .mr-5 /* Margin Right */
.p-1 .p-2 .p-3 .p-4         /* Padding */
```

### Text
```css
.text-center   /* Text Center */
.text-right    /* Text Right */
.text-bold     /* Bold text */
.text-muted    /* Gray text */
.text-danger   /* Red text */
.text-success  /* Green text */
```

### Flexbox
```css
.flex            /* Display flex */
.flex-center     /* Center content */
.flex-between    /* Space between */
.flex-column     /* Column direction */
.gap-2 .gap-3    /* Gap between items */
```

### Grid
```css
.grid-2   /* 2 columns */
.grid-3   /* 3 columns */
.grid-4   /* 4 columns */
```

---

## 9. Common Patterns

### Form with Validation
```jsx
const [data, setData] = useState({ email: '' });
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setData({ ...data, [name]: value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    showLoading('Submitting...');
    await api.submit(data);
    closeLoading();
    showSuccess('Submitted successfully');
  } catch (error) {
    closeLoading();
    showError(error.message);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={data.email}
        onChange={handleChange}
        className="form-control"
        placeholder="your@email.com"
      />
      {errors.email && <span className="error-text">{errors.email}</span>}
    </div>
    <button type="submit" className="btn btn-primary btn-large">
      Submit
    </button>
  </form>
);
```

---

## 10. Migration Checklist

Use this checklist when updating each page:

- [ ] Replace static `<div className="card">` with `<Card>` component
- [ ] Replace all image tags with fallback handling using `getEquipmentImage()`
- [ ] Replace all `window.confirm()` with `showConfirm()`
- [ ] Replace all `alert()` with `showSuccess()` or `showError()`
- [ ] Add `<Loader>` component while loading data
- [ ] Add `<EmptyState>` when no data available
- [ ] Replace status indicators with Badge components
- [ ] Update CSS classes to use modern utilities (mt-2, mb-3, etc.)
- [ ] Verify all colors use CSS variables
- [ ] Test responsive design on mobile
- [ ] Remove any hardcoded colors or old styles

---

## 11. File Structure for Components

```
src/
  components/
    Badge/
      Badge.jsx          # Component
      Badge.css          # Styles
    Card/
      Card.jsx           # Component
      Card.css           # Styles
    EmptyState/
      EmptyState.jsx     # Component
      EmptyState.css     # Styles
    Loader/
      Loader.jsx         # Component
      Loader.css         # Styles
  utils/
    imageUtils.js        # Image utilities
    sweetalert.js        # Alert utilities
  App.css                # Global styles & CSS variables
  index.css              # Base styles & animations
```

---

## 12. Testing Updated Components

After updating a page:

1. **Visual Test**: Does it look good on desktop and mobile?
2. **Functionality Test**: Do all buttons and forms work?
3. **Loading State Test**: Does the loader appear while loading?
4. **Empty State Test**: Does empty state show when no data?
5. **Error Handling Test**: Do error messages display correctly?
6. **Responsive Test**: Resize browser - does layout adapt?

---

**Pro Tips:**
- Start with MyBookings page as it's good practice
- Reuse your Card/Badge patterns across similar pages
- Don't mix old and new styling in the same component
- Test each change before moving to next update
- Keep Component imports at top of file

Good luck with the migrations! 🚀
