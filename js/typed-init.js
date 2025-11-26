// Typed.js Initialization
// Typing animation for hero section

(function() {
  'use strict';

  // Check if Typed.js is available
  if (typeof Typed === 'undefined') {
    console.warn('Typed.js is not loaded. Typing animation will not work.');
    return;
  }

  // Initialize typing animation
  function initTyped() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    // Get current language
    const lang = window.LanguageManager?.currentLang || 'en';

    // Strings based on language
    const strings = lang === 'ar' ? [
      'أدوات مجانية على الإنترنت',
      'معالجة النصوص',
      'تنسيق الكود',
      'تحرير الصور',
      'جميع الأدوات في مكان واحد',
      'متاحة 24/7'
    ] : [
      'Free Online Tools',
      'Text Processing',
      'Code Formatting',
      'Image Editing',
      'All Tools in One Place',
      'Available 24/7'
    ];

    // Create typed instance
    const typed = new Typed(heroTitle, {
      strings: strings,
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      smartBackspace: true
    });

    // Store instance for cleanup
    window.typedInstance = typed;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTyped);
  } else {
    initTyped();
  }

  // Re-initialize on language change
  if (window.LanguageManager) {
    const originalUpdate = window.LanguageManager.updatePageLanguage;
    window.LanguageManager.updatePageLanguage = function() {
      originalUpdate.call(this);
      // Destroy old instance
      if (window.typedInstance) {
        window.typedInstance.destroy();
        window.typedInstance = null;
      }
      // Re-initialize
      setTimeout(initTyped, 100);
    };
  }

  console.log('Typed.js initialized');
})();

