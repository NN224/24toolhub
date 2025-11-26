// Security Utilities using DOMPurify
// Sanitize user input to prevent XSS attacks

(function() {
  'use strict';

  // Check if DOMPurify is available
  if (typeof DOMPurify === 'undefined') {
    console.warn('DOMPurify is not loaded. Security features may be limited.');
    return;
  }

  // Sanitize HTML string
  window.sanitizeHTML = function(dirty) {
    try {
      return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target']
      });
    } catch (e) {
      console.error('Error sanitizing HTML:', e);
      return '';
    }
  };

  // Sanitize text (remove all HTML)
  window.sanitizeText = function(dirty) {
    try {
      return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
    } catch (e) {
      console.error('Error sanitizing text:', e);
      return '';
    }
  };

  // Sanitize URL
  window.sanitizeURL = function(url) {
    try {
      const sanitized = DOMPurify.sanitize(url);
      // Additional URL validation
      try {
        new URL(sanitized);
        return sanitized;
      } catch {
        return '';
      }
    } catch (e) {
      console.error('Error sanitizing URL:', e);
      return '';
    }
  };

  // Auto-sanitize all user inputs (optional - can be enabled/disabled)
  window.enableAutoSanitize = function() {
    document.addEventListener('input', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        const originalValue = e.target.value;
        const sanitized = window.sanitizeText(originalValue);
        if (originalValue !== sanitized) {
          e.target.value = sanitized;
        }
      }
    });
  };

  console.log('Security utilities initialized with DOMPurify');
})();

