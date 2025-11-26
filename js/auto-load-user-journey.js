// Auto-load user-journey.js for all tool pages
// This script should be included in main.js or loaded before it

(function() {
  'use strict';
  
  // Only load on tool pages (not homepage)
  const isToolPage = window.location.pathname !== '/' && 
                     !window.location.pathname.endsWith('index.html') &&
                     window.location.pathname.includes('/tools/');
  
  if (isToolPage && !document.querySelector('script[src*="user-journey.js"]')) {
    const script = document.createElement('script');
    script.src = '../js/user-journey.js';
    script.async = true;
    document.head.appendChild(script);
  }
})();

