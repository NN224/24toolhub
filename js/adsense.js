// Google AdSense Component for 24ToolHub
// This file manages all AdSense ad placements across the website

const AdSense = {
  // Your AdSense Publisher ID
  publisherId: 'ca-pub-2446710277775155',
  
  // Ad slot IDs for different ad formats
  adSlots: {
    leaderboard: '1234567890', // 728x90 - Replace with your actual slot ID
    rectangle: '2345678901',   // 336x280 - Replace with your actual slot ID  
    mobile: '3456789012',      // 320x50 - Replace with your actual slot ID
    square: '4567890123',      // 250x250 - Replace with your actual slot ID
    largeRectangle: '5678901234', // 336x280 or 300x250
    responsive: '6789012345'   // Responsive ad unit
  },

  // Initialize AdSense on page load
  init() {
    // Check if AdSense script is already loaded
    if (!window.adsbygoogle) {
      window.adsbygoogle = window.adsbygoogle || [];
    }
    
    // Replace ad space placeholders with actual ads
    this.replacePlaceholders();
    
    // Setup lazy loading for ads below the fold
    this.setupLazyLoading();
  },

  // Create an ad unit
  createAdUnit(format = 'responsive', customSlot = null) {
    const slot = customSlot || this.adSlots[format] || this.adSlots.responsive;
    
    const adContainer = document.createElement('div');
    adContainer.className = 'ad-container';
    
    // Create AdSense ins element
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', this.publisherId);
    ins.setAttribute('data-ad-slot', slot);
    
    // Set specific dimensions based on format
    switch(format) {
      case 'leaderboard':
        ins.style.width = '728px';
        ins.style.height = '90px';
        ins.setAttribute('data-ad-format', 'horizontal');
        break;
      case 'rectangle':
        ins.style.width = '336px';
        ins.style.height = '280px';
        break;
      case 'mobile':
        ins.style.width = '320px';
        ins.style.height = '50px';
        ins.setAttribute('data-ad-format', 'horizontal');
        break;
      case 'square':
        ins.style.width = '250px';
        ins.style.height = '250px';
        break;
      case 'largeRectangle':
        ins.style.width = '336px';
        ins.style.height = '280px';
        break;
      case 'responsive':
      default:
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        ins.style.width = '100%';
        ins.style.minHeight = '90px';
        break;
    }
    
    adContainer.appendChild(ins);
    
    // Add fallback message for ad blockers
    const fallback = document.createElement('div');
    fallback.className = 'ad-fallback';
    fallback.style.display = 'none';
    fallback.innerHTML = `
      <div style="
        padding: 20px;
        background: var(--bg-secondary, #f5f5f5);
        border: 1px solid var(--border-color, #ddd);
        border-radius: 8px;
        text-align: center;
        color: var(--text-secondary, #666);
      ">
        <p style="margin: 0 0 10px 0; font-weight: 600;">
          ${this.getTranslation('adBlockerDetected')}
        </p>
        <p style="margin: 0; font-size: 0.9em;">
          ${this.getTranslation('supportUs')}
        </p>
      </div>
    `;
    adContainer.appendChild(fallback);
    
    return adContainer;
  },

  // Replace placeholder ad spaces with real ads
  replacePlaceholders() {
    const adSpaces = document.querySelectorAll('.ad-space');
    
    adSpaces.forEach(space => {
      // Determine ad format based on class
      let format = 'responsive';
      if (space.classList.contains('ad-leaderboard')) {
        format = 'leaderboard';
      } else if (space.classList.contains('ad-rectangle')) {
        format = 'rectangle';
      } else if (space.classList.contains('ad-mobile')) {
        format = 'mobile';
      } else if (space.classList.contains('ad-square')) {
        format = 'square';
      }
      
      // Clear placeholder content
      space.innerHTML = '';
      
      // Add the ad unit
      const adUnit = this.createAdUnit(format);
      space.appendChild(adUnit);
      
      // Push to AdSense queue
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push failed:', e);
      }
    });
  },

  // Setup lazy loading for ads below the fold
  setupLazyLoading() {
    const lazyAds = document.querySelectorAll('.ad-space[data-lazy="true"]');
    
    if ('IntersectionObserver' in window) {
      const adObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const adSpace = entry.target;
            if (!adSpace.hasAttribute('data-loaded')) {
              this.loadAd(adSpace);
              adSpace.setAttribute('data-loaded', 'true');
              adObserver.unobserve(adSpace);
            }
          }
        });
      }, {
        rootMargin: '100px' // Start loading 100px before the ad enters viewport
      });
      
      lazyAds.forEach(ad => adObserver.observe(ad));
    } else {
      // Fallback for older browsers
      lazyAds.forEach(ad => this.loadAd(ad));
    }
  },

  // Load a single ad
  loadAd(adSpace) {
    // Determine format and create ad
    let format = 'responsive';
    if (adSpace.classList.contains('ad-leaderboard')) format = 'leaderboard';
    else if (adSpace.classList.contains('ad-rectangle')) format = 'rectangle';
    else if (adSpace.classList.contains('ad-mobile')) format = 'mobile';
    
    adSpace.innerHTML = '';
    const adUnit = this.createAdUnit(format);
    adSpace.appendChild(adUnit);
    
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('Lazy ad load failed:', e);
    }
  },

  // Check for ad blocker
  detectAdBlocker(callback) {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        callback(true); // Ad blocker detected
      } else {
        callback(false); // No ad blocker
      }
      document.body.removeChild(testAd);
    }, 100);
  },

  // Show ad blocker message
  showAdBlockerMessage() {
    const adSpaces = document.querySelectorAll('.ad-space');
    adSpaces.forEach(space => {
      const fallback = space.querySelector('.ad-fallback');
      if (fallback) {
        fallback.style.display = 'block';
      }
    });
  },

  // Get translation for ad-related messages
  getTranslation(key) {
    const lang = document.documentElement.lang || 'en';
    const translations = {
      en: {
        adBlockerDetected: 'Ad Blocker Detected',
        supportUs: 'Please consider disabling your ad blocker to support our free tools.',
        advertisement: 'Advertisement',
        sponsoredContent: 'Sponsored Content'
      },
      ar: {
        adBlockerDetected: 'تم اكتشاف مانع الإعلانات',
        supportUs: 'يرجى تعطيل مانع الإعلانات لدعم أدواتنا المجانية.',
        advertisement: 'إعلان',
        sponsoredContent: 'محتوى مدعوم'
      }
    };
    
    return translations[lang][key] || translations.en[key];
  },

  // Refresh ads (useful for single-page applications)
  refresh() {
    const adSpaces = document.querySelectorAll('.ad-space[data-loaded="true"]');
    adSpaces.forEach(space => {
      space.removeAttribute('data-loaded');
      this.loadAd(space);
    });
  },

  // Destroy all ads (cleanup)
  destroy() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => container.remove());
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AdSense.init();
    
    // Check for ad blocker after a delay
    setTimeout(() => {
      AdSense.detectAdBlocker((blocked) => {
        if (blocked) {
          console.log('Ad blocker detected');
          AdSense.showAdBlockerMessage();
        }
      });
    }, 2000);
  });
} else {
  // DOM is already loaded
  AdSense.init();
  
  setTimeout(() => {
    AdSense.detectAdBlocker((blocked) => {
      if (blocked) {
        AdSense.showAdBlockerMessage();
      }
    });
  }, 2000);
}

// Export for use in other scripts
window.AdSense = AdSense;
