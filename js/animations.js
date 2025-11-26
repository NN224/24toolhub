// AOS (Animate On Scroll) Initialization
// Add scroll animations to improve visual appeal

(function() {
  'use strict';

  // Check if AOS is available
  if (typeof AOS === 'undefined') {
    console.warn('AOS is not loaded. Animations will not work.');
    return;
  }

  // Initialize AOS
  function initAOS() {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true, // Animation happens only once
      offset: 100,
      delay: 0,
      anchorPlacement: 'top-bottom',
      disable: function() {
        // Disable on mobile if needed
        return window.innerWidth < 768;
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAOS);
  } else {
    initAOS();
  }

  // Refresh AOS when new content is added
  window.refreshAnimations = function() {
    AOS.refresh();
  };

  console.log('AOS animations initialized');
})();

