// Apply AOS attributes to tool cards dynamically
// This ensures all tool cards get animations even if added dynamically

(function() {
  'use strict';

  function applyAOSAttributes() {
    const toolCards = document.querySelectorAll('.tool-card:not([data-aos])');
    let delay = 0;

    toolCards.forEach((card, index) => {
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', delay.toString());
      delay += 50; // Stagger animations
      
      // Reset delay every 10 cards to avoid too long delays
      if ((index + 1) % 10 === 0) {
        delay = 0;
      }
    });

    // Refresh AOS if it's already initialized
    if (window.AOS && typeof window.AOS.refresh === 'function') {
      window.AOS.refresh();
    }
  }

  // Apply on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAOSAttributes);
  } else {
    applyAOSAttributes();
  }

  // Re-apply when new content is added
  const observer = new MutationObserver(() => {
    applyAOSAttributes();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('AOS attributes applied to tool cards');
})();

