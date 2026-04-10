import Swal from 'sweetalert2';

// Global Theme Configuration
const THEME_CONFIG = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#ef4444',
  allowOutsideClick: false,
  allowEscapeKey: true,
  backdrop: true,
};

// Create reusable instance
const MySwal = Swal.mixin(THEME_CONFIG);

// 🔹 General Alert
export const showAlert = (message, type = 'info', title = null) => {
  const titleText =
    title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Information');

  return MySwal.fire({
    title: titleText,
    text: message,
    icon: type,
    confirmButtonText: 'OK',
  });
};

// 🔹 Confirm Dialog
export const showConfirm = (message, title = 'Are you sure?') => {
  return MySwal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, confirm',
    cancelButtonText: 'Cancel',
  }).then((result) => result.isConfirmed);
};

// 🔹 Success Alert
export const showSuccess = (message, title = 'Success!') => {
  return MySwal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#10b981',
    timer: 3000,
    timerProgressBar: true,
  });
};

// 🔹 Error Alert
export const showError = (message, title = 'Error!') => {
  return MySwal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#ef4444',
  });
};

// 🔹 Warning Alert
export const showWarning = (message, title = 'Warning!') => {
  return MySwal.fire({
    title,
    text: message,
    icon: 'warning',
    confirmButtonColor: '#f59e0b',
  });
};

// 🔹 Info Alert
export const showInfo = (message, title = 'Information') => {
  return MySwal.fire({
    title,
    text: message,
    icon: 'info',
    timer: 3000,
    timerProgressBar: true,
  });
};

// 🔹 Loading Alert
export const showLoading = (message = 'Processing...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// 🔹 Close Loading
export const closeLoading = () => {
  Swal.close();
};

// 🔹 Custom Confirm (Advanced)
export const showConfirmWithOptions = (options = {}) => {
  const {
    title = 'Are you sure?',
    message = '',
    confirmText = 'Yes, confirm',
    cancelText = 'Cancel',
    confirmColor = '#3b82f6',
    cancelColor = '#ef4444',
    icon = 'question',
  } = options;

  return MySwal.fire({
    title,
    text: message,
    icon,
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: cancelColor,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  }).then((result) => result.isConfirmed);
};

// 🔹 Toast Notification
export const showToast = (message, type = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  return Toast.fire({
    icon: type,
    title: message,
  });
};

// 🔹 Export All
export default {
  showAlert,
  showConfirm,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  closeLoading,
  showConfirmWithOptions,
  showToast,
};