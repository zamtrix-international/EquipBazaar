export const EQUIPMENT_TYPES = {
  TRACTOR: 'Tractor',
  JCB: 'JCB',
  CRANE: 'Crane',
  DUMPER: 'Dumper'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  ONLINE: 'online',
  CARD: 'card'
};

export const MEERUT_LOCATIONS = [
  'Meerut Cantt',
  'Modipuram',
  'Partapur',
  'Delhi Road',
  'Garh Road',
  'Roorkee Road',
  'Shastri Nagar',
  'Lalkurti',
  'Sardhana',
  'Kanker Khera'
];

export const PRICE_RANGES = {
  TRACTOR: { min: 500, max: 2000 },
  JCB: { min: 800, max: 3000 },
  CRANE: { min: 1500, max: 5000 },
  DUMPER: { min: 1000, max: 4000 }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  EQUIPMENT: {
    BASE: '/equipments',
    SEARCH: '/equipments',
    CATEGORIES: '/equipments'
  },
  BOOKINGS: {
    BASE: '/bookings',
    MY_BOOKINGS: '/bookings',
    CANCEL: (id) => `/bookings/${id}/status`
  },
  VENDOR: {
    DASHBOARD: '/vendors/me',
    EARNINGS: '/payouts',
    KYC: '/vendors/me/kyc'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    VENDORS: '/users',
    USERS: '/users',
    REPORTS: '/reports'
  }
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  BOOKING_CREATED: 'Booking created successfully!',
  EQUIPMENT_ADDED: 'Equipment added successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!'
};