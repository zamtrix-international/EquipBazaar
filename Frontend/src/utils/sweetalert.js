// utils/sweetalert.js
import Swal from 'sweetalert2';

// Custom alert function to replace window.alert
export const showAlert = (message, type = 'info') => {
  return Swal.fire({
    title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
    text: message,
    icon: type,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
  });
};

// Custom confirm function to replace window.confirm
export const showConfirm = (message, title = 'Are you sure?') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
  }).then((result) => result.isConfirmed);
};

// Success alert
export const showSuccess = (message, title = 'Success!') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#28a745',
  });
};

// Error alert
export const showError = (message, title = 'Error!') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545',
  });
};

// Warning alert
export const showWarning = (message, title = 'Warning!') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ffc107',
  });
};

// Info alert
export const showInfo = (message, title = 'Info') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#17a2b8',
  });
};

// Custom toast notifications
export const showToast = (message, type = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon: type,
    title: message,
  });
};