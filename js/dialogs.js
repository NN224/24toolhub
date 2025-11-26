// SweetAlert2 Integration
// Replace confirm() and alert() with beautiful dialogs

(function() {
  'use strict';

  // Check if SweetAlert2 is available
  if (typeof Swal === 'undefined') {
    console.warn('SweetAlert2 is not loaded. Falling back to default dialogs.');
    return;
  }

  // Custom confirm function
  window.showConfirm = function(message, title = 'Confirm', confirmText = 'Yes', cancelText = 'Cancel') {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then((result) => {
      return result.isConfirmed;
    });
  };

  // Custom alert function
  window.showAlert = function(message, title = 'Alert', icon = 'info') {
    return Swal.fire({
      title: title,
      text: message,
      icon: icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#667eea'
    });
  };

  // Success dialog
  window.showSuccess = function(message, title = 'Success!') {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#10b981'
    });
  };

  // Error dialog
  window.showError = function(message, title = 'Error!') {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    });
  };

  // Warning dialog
  window.showWarning = function(message, title = 'Warning!') {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b'
    });
  };

  // Input dialog
  window.showInput = function(message, title = 'Input', placeholder = 'Enter value', inputType = 'text') {
    return Swal.fire({
      title: title,
      input: inputType,
      inputLabel: message,
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a value!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        return result.value;
      }
      return null;
    });
  };

  console.log('SweetAlert2 dialogs initialized');
})();

