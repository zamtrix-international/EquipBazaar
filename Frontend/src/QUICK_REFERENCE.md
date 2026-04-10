# UI/UX Quick Reference

## 🎨 Colors & Variables

Every color is defined as a CSS variable. Use in your CSS:
```css
color: var(--primary-color);
background-color: var(--success-color);
box-shadow: var(--shadow-md);
```

**Available Variables:**
```
--primary-color        #3b82f6 (Blue)
--primary-dark         #1e40af
--primary-light        #dbeafe
--success-color        #10b981
--success-dark         #059669
--danger-color         #ef4444
--warning-color        #f59e0b
--neutral-100 to 900   Gray shades
--shadow-sm to shadow-xl
--radius-sm to radius-full
--transition           all 0.3s ease
```

---

## 🔧 Import Paths

```javascript
// Utilities
import { getEquipmentImage, PLACEHOLDERS } from '../utils/imageUtils';
import { showConfirm, showSuccess, showToast } from '../utils/sweetalert';

// Components
import Loader, { Spinner, PageLoader } from '../components/Loader/Loader';
import EmptyState, { ErrorState, NoResults } from '../components/EmptyState/EmptyState';
import Card, { CardHeader, CardBody, CardFooter, CardTitle } from '../components/Card/Card';
import Badge, { BadgeSuccess, BadgeDanger } from '../components/Badge/Badge';
```

---

## 🎯 Most Used Components

### Alert Confirmations
```javascript
const confirmed = await showConfirm('Delete this item?', 'Confirm Delete');
if (confirmed) {
  // perform action
}
```

### Loading Indicator
```javascript
{isLoading ? <Loader message="Loading..." size="medium" /> : <Content />}
```

### Equipment Image with Fallback
```javascript
<img src={getEquipmentImage(equipment)} alt="Equipment" />
```

### Status Badge
```javascript
<BadgeSuccess pill={true}>{booking.status}</BadgeSuccess>
```

### Empty State
```javascript
{items.length === 0 && <EmptyState title="No items found" />}
```

---

## 🎬 Animations & Transitions

- **Loaders**: Auto-spinning with smooth animation
- **Button Hover**: Slight lift and color change (0.3s transition)
- **Card Hover**: Shadow elevation and scale (optional)
- **Toast**: Slide-in from bottom-right, auto-dismiss 2s

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Default: Mobile (< 640px) */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large Desktop */ }
```

---

## 🚫 What NOT to Do

❌ Don't use `window.alert()` or `window.confirm()`  
❌ Don't hardcode colors - use CSS variables  
❌ Don't add new image without fallback handling  
❌ Don't create custom styled alerts - use SweetAlert2  

---

## ✅ Best Practices

✅ Always use image utilities for equipment/user photos  
✅ Show loaders during API calls  
✅ Use badges for status indicators  
✅ Display empty states when no data  
✅ Use showConfirm for destructive actions  
✅ Use showToast for success/info messages  

---

## 🎨 Button Classes

```html
<!-- Primary Actions -->
<button class="btn btn-primary">Submit</button>
<button class="btn btn-primary btn-small">Small</button>
<button class="btn btn-primary btn-large">Large</button>

<!-- Secondary Actions -->
<button class="btn btn-secondary">Cancel</button>

<!-- Success -->
<button class="btn btn-success">Approve</button>

<!-- Danger -->
<button class="btn btn-danger">Delete</button>

<!-- Disabled State -->
<button class="btn btn-primary" disabled>Loading...</button>
```

---

## 🏷️ Badge Classes

```html
<span class="badge badge-primary">PRIMARY</span>
<span class="badge badge-success badge-pill">SUCCESS</span>
<span class="badge badge-danger badge-sm">DANGER</span>
<span class="badge badge-warning badge-lg">WARNING</span>
```

---

## 📊 Grid Layout

```html
<!-- 2-column grid -->
<div class="grid grid-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- 3-column grid -->
<div class="grid grid-3">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>
```

---

## 🔄 API Response Feedback

```javascript
try {
  showLoading('Processing...');
  const response = await api.call();
  closeLoading();
  showSuccess('Operation successful!');
  navigate('/next-page');
} catch (error) {
  closeLoading();
  showError(error.message, 'Operation Failed');
}
```

---

## 📸 Image Handling

```javascript
// Equipment images
const equipmentImage = getEquipmentImage(booking, PLACEHOLDERS.EQUIPMENT);

// User avatars
const avatarImage = getUserAvatar(user, PLACEHOLDERS.USER_AVATAR);

// Custom fallback
const customImage = resolveImageUrl(imageUrl, PLACEHOLDERS.BANNER);

// With error handling
<img 
  src={getEquipmentImage(item)} 
  alt="Equipment"
  onError={(e) => e.target.src = PLACEHOLDERS.EQUIPMENT}
/>
```

---

## 🎁 Ready-to-Use Placeholders

We have 5 built-in ASCII SVG placeholders (as data URIs):
1. `EQUIPMENT` - Generic equipment
2. `USER_AVATAR` - User profile picture
3. `CATEGORY` - Category/Collection
4. `BANNER` - Full-width hero image
5. `LOADING` - Animated loading state

---

## 📝 Form Styling

```html
<div class="form-group">
  <label for="email">Email Address</label>
  <input 
    type="email" 
    id="email" 
    placeholder="you@example.com"
    class="form-control"
  />
  <span class="error-text">Invalid email format</span>
</div>
```

---

## 🎭 Custom Alerts

```javascript
// Confirmation with custom buttons
const result = await showConfirmWithOptions({
  title: 'Approve Return?',
  message: 'Are you sure you want to approve this return request?',
  confirmText: 'Approve',
  cancelText: 'Reject',
  icon: 'question'
});

// Toast notification
showToast('Action completed!', 'success');
showToast('Something went wrong!', 'error');
showToast('Please wait...', 'warning');
```

---

## 🔍 Common Use Cases

### Delete Confirmation
```javascript
const confirm = await showConfirm(
  'This action cannot be undone.',
  'Delete Item?'
);
if (confirm) api.delete();
```

### Return Approval
```javascript
showLoading('Confirming return...');
await api.approveReturn(bookingId);
closeLoading();
showSuccess('Return approved!');
```

### Equipment Not Found
```javascript
<EmptyState 
  title="Equipment Not Found" 
  message="The equipment you're looking for doesn't exist."
/>
```

### Loading Equipment List
```javascript
{loading ? (
  <Loader message="Loading equipment..." />
) : filteredEquipment.length ? (
  <EquipmentGrid items={filteredEquipment} />
) : (
  <EmptyState title="No equipment found" />
)}
```

---

**Version**: 1.0  
**Keep this handy for quick reference!**
