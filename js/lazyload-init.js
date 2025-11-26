// LazyLoad Initialization
// Lazy load images and content for better performance

(function() {
  'use strict';

  // Check if LazyLoad is available
  if (typeof LazyLoad === 'undefined') {
    console.warn('LazyLoad is not loaded. Performance may be affected.');
    return;
  }

  // Initialize LazyLoad instance
  let lazyLoadInstance = null;

  function initLazyLoad() {
    if (lazyLoadInstance) {
      return lazyLoadInstance;
    }

    lazyLoadInstance = new LazyLoad({
      elements_selector: '.lazy',
      threshold: 0,
      load_delay: 100,
      callback_loaded: function(el) {
        el.classList.add('lazy-loaded');
      },
      callback_error: function(el) {
        el.classList.add('lazy-error');
        console.warn('Failed to load lazy image:', el);
      }
    });

    return lazyLoadInstance;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }

  // Re-initialize when new content is added (for dynamic content)
  window.reinitLazyLoad = function() {
    if (lazyLoadInstance) {
      lazyLoadInstance.update();
    } else {
      initLazyLoad();
    }
  };

  // Make LazyLoad instance globally available
  window.lazyLoadInstance = lazyLoadInstance;

  console.log('LazyLoad initialized');
})();

