// Notifications using Notyf
// Replace alert() and custom notifications with Notyf

(function() {
  'use strict';

  // Check if Notyf is available
  if (typeof Notyf === 'undefined') {
    console.warn('Notyf is not loaded. Falling back to default notifications.');
    // Fallback to existing notification system
    return;
  }

  // Initialize Notyf instance
  const notyf = new Notyf({
    duration: 3000,
    position: {
      x: 'right',
      y: 'top',
    },
    dismissible: true,
    ripple: true,
    types: [
      {
        type: 'warning',
        background: '#f59e0b',
        icon: {
          className: 'material-icons',
          tagName: 'i',
          text: 'warning'
        }
      },
      {
        type: 'info',
        background: '#3b82f6',
        icon: {
          className: 'material-icons',
          tagName: 'i',
          text: 'info'
        }
      }
    ]
  });

  // Global notification function
  window.showNotification = function(message, type = 'success') {
    if (!message) return;

    const messageText = typeof message === 'string' ? message : String(message);

    switch (type) {
      case 'success':
        notyf.success(messageText);
        break;
      case 'error':
        notyf.error(messageText);
        break;
      case 'warning':
        notyf.open({
          type: 'warning',
          message: messageText
        });
        break;
      case 'info':
        notyf.open({
          type: 'info',
          message: messageText
        });
        break;
      default:
        notyf.success(messageText);
    }
  };

  // Replace window.Utils.showNotification if it exists
  if (window.Utils) {
    window.Utils.showNotification = window.showNotification;
  }

  // Make notyf instance available globally
  window.notyf = notyf;

  console.log('Notifications initialized with Notyf');
})();

