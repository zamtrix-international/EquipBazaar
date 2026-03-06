/**
 * Booking Status Service
 * Manages booking status transitions and validations
 */

const bookingStatusConstants = require('../constants/bookingStatus');

/**
 * Get allowed transitions for a booking status
 */
const getAllowedTransitions = (currentStatus) => {
  const transitions = {
    [bookingStatusConstants.PENDING]: [
      bookingStatusConstants.ACCEPTED,
      bookingStatusConstants.REJECTED,
      bookingStatusConstants.CANCELLED,
    ],
    [bookingStatusConstants.ACCEPTED]: [
      bookingStatusConstants.PICKUP_SCHEDULED,
      bookingStatusConstants.CANCELLED,
    ],
    [bookingStatusConstants.PICKUP_SCHEDULED]: [
      bookingStatusConstants.PICKED_UP,
      bookingStatusConstants.CANCELLED,
    ],
    [bookingStatusConstants.PICKED_UP]: [
      bookingStatusConstants.DELIVERED,
      bookingStatusConstants.CANCELLED,
    ],
    [bookingStatusConstants.DELIVERED]: [
      bookingStatusConstants.RETURNED,
      bookingStatusConstants.DISPUTED,
    ],
    [bookingStatusConstants.RETURNED]: [
      bookingStatusConstants.COMPLETED,
    ],
    [bookingStatusConstants.DISPUTED]: [
      bookingStatusConstants.RESOLVED,
      bookingStatusConstants.REJECTED,
    ],
    [bookingStatusConstants.COMPLETED]: [],
    [bookingStatusConstants.CANCELLED]: [],
    [bookingStatusConstants.REJECTED]: [],
  };

  return transitions[currentStatus] || [];
};

/**
 * Validate status transition
 */
const isValidTransition = (currentStatus, newStatus) => {
  const allowed = getAllowedTransitions(currentStatus);
  return allowed.includes(newStatus);
};

/**
 * Get status display name
 */
const getStatusDisplayName = (status) => {
  const displayNames = {
    [bookingStatusConstants.PENDING]: 'Pending Approval',
    [bookingStatusConstants.ACCEPTED]: 'Accepted',
    [bookingStatusConstants.REJECTED]: 'Rejected',
    [bookingStatusConstants.PICKUP_SCHEDULED]: 'Pickup Scheduled',
    [bookingStatusConstants.PICKED_UP]: 'Picked Up',
    [bookingStatusConstants.DELIVERED]: 'Delivered',
    [bookingStatusConstants.RETURNED]: 'Returned',
    [bookingStatusConstants.COMPLETED]: 'Completed',
    [bookingStatusConstants.CANCELLED]: 'Cancelled',
    [bookingStatusConstants.DISPUTED]: 'Disputed',
    [bookingStatusConstants.RESOLVED]: 'Resolved',
  };
  return displayNames[status] || status;
};

module.exports = {
  getAllowedTransitions,
  isValidTransition,
  getStatusDisplayName,
};
