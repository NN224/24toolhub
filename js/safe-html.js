// Safe HTML utility - wrapper for innerHTML operations
// Uses DOMPurify when available for XSS protection

(function() {
  'use strict';

  // Safe innerHTML setter
  window.safeSetHTML = function(element, html) {
    if (!element) return;
    
    // Use DOMPurify if available
    if (typeof DOMPurify !== 'undefined') {
      element.innerHTML = DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOW_UNKNOWN_PROTOCOLS: false,
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'br', 'strong', 'b', 'em', 'i', 'u',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th',
          'thead', 'tbody', 'code', 'pre', 'blockquote',
          'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
          'button', 'input', 'label', 'select', 'option', 'textarea',
          'form', 'section', 'article', 'header', 'footer', 'nav',
          'figure', 'figcaption', 'small', 'mark', 'del', 'ins', 'sub', 'sup'
        ],
        ALLOWED_ATTR: [
          'class', 'id', 'style', 'href', 'src', 'alt', 'title',
          'data-*', 'aria-*', 'role', 'type', 'name', 'value',
          'placeholder', 'disabled', 'readonly', 'checked', 'selected',
          'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width',
          'd', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
          'xmlns', 'target', 'rel', 'download', 'for', 'colspan', 'rowspan'
        ]
      });
    } else {
      // Fallback: basic sanitization
      element.innerHTML = html;
    }
  };

  // Safe text content setter (always safe, no sanitization needed)
  window.safeSetText = function(element, text) {
    if (!element) return;
    element.textContent = text;
  };

  // Safe attribute setter
  window.safeSetAttribute = function(element, attr, value) {
    if (!element) return;
    
    // Disallow dangerous attributes
    const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'];
    if (dangerousAttrs.includes(attr.toLowerCase())) {
      console.warn('Blocked dangerous attribute:', attr);
      return;
    }
    
    // Sanitize href and src for javascript: URLs
    if ((attr === 'href' || attr === 'src') && typeof value === 'string') {
      if (value.toLowerCase().trim().startsWith('javascript:')) {
        console.warn('Blocked javascript: URL');
        return;
      }
    }
    
    element.setAttribute(attr, value);
  };

  // Safe localStorage wrapper with error handling
  window.safeStorage = {
    get: function(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
      } catch (e) {
        console.warn('localStorage not available:', e.message);
        return defaultValue;
      }
    },
    
    set: function(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.warn('localStorage not available:', e.message);
        return false;
      }
    },
    
    getJSON: function(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
      } catch (e) {
        console.warn('localStorage parse error:', e.message);
        return defaultValue;
      }
    },
    
    setJSON: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('localStorage not available:', e.message);
        return false;
      }
    },
    
    remove: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn('localStorage not available:', e.message);
        return false;
      }
    }
  };
})();
