// Quicklink Initialization
// Prefetch links in viewport for faster navigation

(function() {
  'use strict';

  // Check if Quicklink is available
  if (typeof quicklink === 'undefined') {
    console.warn('Quicklink is not loaded. Prefetch will not work.');
    return;
  }

  // Initialize Quicklink
  function initQuicklink() {
    // Only on homepage (where tool links are)
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
      quicklink.listen({
        ignores: [
          // Ignore external links
          /^https?:\/\/(?!24toolhub\.com)/,
          // Ignore API endpoints
          /\/api\//,
          // Ignore anchor links
          uri => uri.includes('#'),
          // Ignore download links
          uri => uri.includes('download'),
          // Ignore mailto/tel links
          uri => uri.startsWith('mailto:') || uri.startsWith('tel:')
        ],
        limit: 10, // Prefetch up to 10 links
        threshold: 0.5, // Prefetch when 50% of link is visible
        delay: 2000, // Wait 2 seconds before prefetching
        timeoutFn: () => 3000, // 3 second timeout
        priority: true // Use fetch() with priority
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuicklink);
  } else {
    initQuicklink();
  }

  console.log('Quicklink initialized for faster navigation');
})();

