// User Journey Improvements
// This file contains enhancements for better user experience

(function() {
  'use strict';

  // Popular Tools (based on common usage)
  const POPULAR_TOOLS = [
    { name: 'Word Counter', url: '/tools/word-counter.html', category: 'text' },
    { name: 'JSON Formatter', url: '/tools/json-formatter.html', category: 'generator' },
    { name: 'QR Code Generator', url: '/tools/qr-code-generator.html', category: 'generator' },
    { name: 'Text Case Converter', url: '/tools/text-case-converter.html', category: 'text' },
    { name: 'URL Encoder', url: '/tools/url-encoder.html', category: 'encoder' },
    { name: 'Base64 Encoder', url: '/tools/base64-encoder.html', category: 'encoder' },
    { name: 'Color Picker', url: '/tools/color-picker.html', category: 'utility' },
    { name: 'Password Generator', url: '/tools/password-generator.html', category: 'generator' }
  ];

  // Related Tools Mapping (expanded)
  const RELATED_TOOLS = {
    'word-counter': [
      { name: 'Text Case Converter', url: '/tools/text-case-converter.html' },
      { name: 'Text Splitter', url: '/tools/text-splitter.html' },
      { name: 'Remove Duplicates', url: '/tools/remove-duplicates.html' }
    ],
    'json-formatter': [
      { name: 'JSON Validator', url: '/tools/json-validator.html' },
      { name: 'JSON to XML', url: '/tools/json-to-xml.html' },
      { name: 'Code Formatter', url: '/tools/code-formatter.html' }
    ],
    'qr-code-generator': [
      { name: 'QR Code Scanner', url: '/tools/qr-scanner.html' },
      { name: 'Barcode Generator', url: '/tools/barcode-generator.html' }
    ],
    'seo-analyzer': [
      { name: 'Website Speed Test', url: '/tools/website-speed-test.html' },
      { name: 'DNS Lookup', url: '/tools/dns-lookup.html' },
      { name: 'Schema Generator', url: '/tools/schema-generator.html' }
    ],
    'text-case-converter': [
      { name: 'Word Counter', url: '/tools/word-counter.html' },
      { name: 'Text Splitter', url: '/tools/text-splitter.html' },
      { name: 'String Reverser', url: '/tools/string-reverser.html' }
    ],
    'base64-encoder': [
      { name: 'URL Encoder', url: '/tools/url-encoder.html' },
      { name: 'HTML Encoder', url: '/tools/html-encoder.html' },
      { name: 'Base64 Decoder', url: '/tools/base64-decoder.html' }
    ],
    'password-generator': [
      { name: 'Password Strength Checker', url: '/tools/password-strength-checker.html' },
      { name: 'UUID Generator', url: '/tools/uuid-generator.html' }
    ],
    'color-picker': [
      { name: 'RGB to HEX Converter', url: '/tools/rgb-to-hex.html' },
      { name: 'Gradient Generator', url: '/tools/gradient-generator.html' }
    ]
  };

  // Quick Actions (for header)
  const QUICK_ACTIONS = [
    { name: 'Word Counter', url: '/tools/word-counter.html', shortcut: 'W' },
    { name: 'JSON', url: '/tools/json-formatter.html', shortcut: 'J' },
    { name: 'QR', url: '/tools/qr-code-generator.html', shortcut: 'Q' },
    { name: 'Base64', url: '/tools/base64-encoder.html', shortcut: 'B' }
  ];

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    initPopularTools();
    initRelatedTools();
    initBackToTop();
    initRecentlyUsed();
    initKeyboardShortcuts();
    initBreadcrumbs();
    initQuickActions();
    initFavorites();
    initShareButtons();
    initTooltips();
    initEmptyStates();
    
    // Initialize sortable after sections are created
    setTimeout(() => {
      if (window.Sortable) {
        initSortables();
      }
    }, 500);
  });
  
  // Initialize sortables for favorites and recent tools
  function initSortables() {
    // This will be handled by sortable-init.js
    // But we can trigger it here if needed
    if (typeof window.initFavoritesSortable === 'function') {
      window.initFavoritesSortable();
    }
    if (typeof window.initRecentToolsSortable === 'function') {
      window.initRecentToolsSortable();
    }
  }

  // 1. Popular Tools Section
  function initPopularTools() {
    // Only on homepage
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
      return;
    }

    const categoryFilters = document.querySelector('.category-filters');
    if (!categoryFilters) return;

    const popularSection = document.createElement('section');
    popularSection.className = 'popular-tools-section';
    popularSection.innerHTML = `
      <h2 class="section-title" style="margin-top: 2rem; margin-bottom: 1rem;">
        <span data-en="⭐ Popular Tools" data-ar="⭐ الأدوات الشائعة">⭐ Popular Tools</span>
      </h2>
      <div class="tools-grid" id="popularToolsGrid"></div>
    `;

    categoryFilters.parentNode.insertBefore(popularSection, categoryFilters.nextSibling);

    const grid = document.getElementById('popularToolsGrid');
    POPULAR_TOOLS.forEach(tool => {
      const card = createToolCard(tool);
      grid.appendChild(card);
    });
  }

  // 2. Related Tools
  function initRelatedTools() {
    // Only on tool pages
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
      return;
    }

    const toolPath = window.location.pathname;
    const toolName = toolPath.split('/').pop().replace('.html', '');

    const relatedTools = RELATED_TOOLS[toolName];
    if (!relatedTools || relatedTools.length === 0) return;

    const toolContainer = document.querySelector('.tool-container');
    if (!toolContainer) return;

    const relatedSection = document.createElement('section');
    relatedSection.className = 'related-tools-section';
    relatedSection.style.cssText = 'margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--border-color);';
    relatedSection.innerHTML = `
      <h3 style="margin-bottom: 1.5rem;" data-en="Related Tools" data-ar="أدوات مشابهة">Related Tools</h3>
      <div class="tools-grid" id="relatedToolsGrid"></div>
    `;

    toolContainer.appendChild(relatedSection);

    const grid = document.getElementById('relatedToolsGrid');
    relatedTools.forEach(tool => {
      const card = createToolCard(tool);
      grid.appendChild(card);
    });
  }

  // 3. Back to Top Button
  function initBackToTop() {
    const button = document.createElement('button');
    button.id = 'backToTop';
    button.className = 'back-to-top';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Back to top');
    button.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: var(--accent-primary, #667eea);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 9998;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(button);

    // Show/hide based on scroll
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
      } else {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
      }
    });

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-5px)';
      button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
  }

  // 4. Recently Used Tools
  function initRecentlyUsed() {
    // Only on homepage
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
      // Track current tool
      const toolPath = window.location.pathname;
      const toolName = document.querySelector('.tool-title')?.textContent || toolPath.split('/').pop().replace('.html', '');
      
      addToRecentlyUsed(toolName, toolPath);
      return;
    }

    const recentTools = getRecentlyUsed();
    if (recentTools.length === 0) return;

    const popularSection = document.querySelector('.popular-tools-section');
    if (!popularSection) return;

    const recentSection = document.createElement('section');
    recentSection.className = 'recent-tools-section';
    recentSection.innerHTML = `
      <h2 class="section-title" style="margin-top: 2rem; margin-bottom: 1rem;">
        <span data-en="🕐 Recently Used" data-ar="🕐 مستخدمة مؤخراً">🕐 Recently Used</span>
      </h2>
      <div class="tools-grid" id="recentToolsGrid"></div>
    `;

    popularSection.parentNode.insertBefore(recentSection, popularSection.nextSibling);

    const grid = document.getElementById('recentToolsGrid');
    recentTools.forEach(tool => {
      const card = createToolCard(tool);
      grid.appendChild(card);
    });
  }

  function getRecentlyUsed() {
    try {
      return JSON.parse(localStorage.getItem('recentTools') || '[]').slice(0, 6);
    } catch (e) {
      return [];
    }
  }

  function addToRecentlyUsed(name, url) {
    try {
      let recent = JSON.parse(localStorage.getItem('recentTools') || '[]');
      recent = recent.filter(t => t.url !== url);
      recent.unshift({ name, url });
      localStorage.setItem('recentTools', JSON.stringify(recent.slice(0, 10)));
    } catch (e) {
      console.error('Failed to save recent tools:', e);
    }
  }

  // 5. Keyboard Shortcuts (Enhanced)
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Press '/' to focus search (only on homepage)
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html'))) {
          e.preventDefault();
          searchInput.focus();
        }
      }

      // Press 'Escape' to clear search
      if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
          searchInput.value = '';
          searchInput.blur();
        }
      }

      // Quick action shortcuts (Ctrl/Cmd + key)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const shortcuts = {
          'w': '/tools/word-counter.html',
          'j': '/tools/json-formatter.html',
          'q': '/tools/qr-code-generator.html',
          'b': '/tools/base64-encoder.html'
        };
        
        if (shortcuts[e.key.toLowerCase()]) {
          e.preventDefault();
          window.location.href = shortcuts[e.key.toLowerCase()];
        }
      }
    });
  }

  // 6. Breadcrumbs
  function initBreadcrumbs() {
    // Only on tool pages
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
      return;
    }

    const toolHeader = document.querySelector('.tool-header');
    if (!toolHeader) return;

    const toolPath = window.location.pathname;
    const toolName = document.querySelector('.tool-title')?.textContent || toolPath.split('/').pop().replace('.html', '').replace(/-/g, ' ');
    
    // Try to determine category from URL or tool name
    let category = 'utility';
    if (toolPath.includes('word-counter') || toolPath.includes('text-')) category = 'text';
    else if (toolPath.includes('json-') || toolPath.includes('code-')) category = 'generator';
    else if (toolPath.includes('seo-') || toolPath.includes('website-')) category = 'analysis';
    else if (toolPath.includes('base64-') || toolPath.includes('url-')) category = 'encoder';
    else if (toolPath.includes('calculator') || toolPath.includes('converter')) category = 'conversion';

    const categoryNames = {
      text: { en: 'Text & String', ar: 'النصوص والسلاسل' },
      generator: { en: 'Generator & Formatter', ar: 'المولدات والمنسقات' },
      analysis: { en: 'Website Analysis', ar: 'تحليل المواقع' },
      encoder: { en: 'Encoder & Crypto', ar: 'التشفير والترميز' },
      conversion: { en: 'Conversion & Calculator', ar: 'التحويل والحاسبات' },
      utility: { en: 'Utility & Misc', ar: 'أدوات متنوعة' }
    };

    const breadcrumbs = document.createElement('nav');
    breadcrumbs.className = 'breadcrumbs';
    breadcrumbs.style.cssText = `
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    `;
    breadcrumbs.innerHTML = `
      <a href="/" data-en="Home" data-ar="الرئيسية">Home</a>
      <span style="margin: 0 0.5rem;">›</span>
      <a href="/#${category}" data-en="${categoryNames[category]?.en || 'Tools'}" data-ar="${categoryNames[category]?.ar || 'الأدوات'}">${categoryNames[category]?.en || 'Tools'}</a>
      <span style="margin: 0 0.5rem;">›</span>
      <span>${toolName}</span>
    `;

    toolHeader.insertBefore(breadcrumbs, toolHeader.firstChild);
  }

  // 7. Quick Actions in Header
  function initQuickActions() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    const quickActions = document.createElement('div');
    quickActions.className = 'quick-actions';
    quickActions.style.cssText = `
      display: flex;
      gap: 0.5rem;
      margin-right: 1rem;
      flex-wrap: wrap;
    `;

    QUICK_ACTIONS.forEach(action => {
      const link = document.createElement('a');
      link.href = action.url;
      link.className = 'quick-action-link';
      link.title = `${action.name} (${action.shortcut})`;
      link.textContent = action.name;
      link.style.cssText = `
        padding: 0.4rem 0.8rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 0.25rem;
        text-decoration: none;
        font-size: 0.85rem;
        color: var(--text-primary);
        transition: all 0.2s ease;
      `;
      link.addEventListener('mouseenter', () => {
        link.style.background = 'var(--accent-primary)';
        link.style.color = 'white';
      });
      link.addEventListener('mouseleave', () => {
        link.style.background = 'var(--bg-secondary)';
        link.style.color = 'var(--text-primary)';
      });
      quickActions.appendChild(link);
    });

    headerActions.insertBefore(quickActions, headerActions.firstChild);
  }

  // 8. Favorites / Saved Tools
  function initFavorites() {
    // Add favorite button to tool pages
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
      // Show favorites section on homepage
      const favorites = getFavorites();
      if (favorites.length > 0) {
        const recentSection = document.querySelector('.recent-tools-section');
        if (recentSection) {
          const favSection = document.createElement('section');
          favSection.className = 'favorites-section';
          favSection.innerHTML = `
            <h2 class="section-title" style="margin-top: 2rem; margin-bottom: 1rem;">
              <span data-en="⭐ Favorites" data-ar="⭐ المفضلة">⭐ Favorites</span>
            </h2>
            <div class="tools-grid" id="favoritesGrid"></div>
          `;
          recentSection.parentNode.insertBefore(favSection, recentSection.nextSibling);
          const grid = document.getElementById('favoritesGrid');
          favorites.forEach(tool => {
            const card = createToolCard(tool);
            grid.appendChild(card);
          });
        }
      }
      return;
    }

    // Add favorite button to tool header
    const toolHeader = document.querySelector('.tool-header');
    if (!toolHeader) return;

    const toolPath = window.location.pathname;
    const toolName = document.querySelector('.tool-title')?.textContent || toolPath.split('/').pop().replace('.html', '');
    const isFavorite = isToolFavorite(toolPath);

    const favButton = document.createElement('button');
    favButton.className = 'favorite-btn';
    favButton.innerHTML = isFavorite ? '⭐' : '☆';
    favButton.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    favButton.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      transition: transform 0.2s ease;
    `;
    favButton.addEventListener('click', () => {
      toggleFavorite(toolName, toolPath);
      favButton.innerHTML = isToolFavorite(toolPath) ? '⭐' : '☆';
      favButton.title = isToolFavorite(toolPath) ? 'Remove from favorites' : 'Add to favorites';
      favButton.style.transform = 'scale(1.2)';
      setTimeout(() => {
        favButton.style.transform = 'scale(1)';
      }, 200);
    });
    favButton.addEventListener('mouseenter', () => {
      favButton.style.transform = 'scale(1.1)';
    });
    favButton.addEventListener('mouseleave', () => {
      favButton.style.transform = 'scale(1)';
    });

    if (toolHeader.style.position !== 'relative') {
      toolHeader.style.position = 'relative';
    }
    toolHeader.appendChild(favButton);
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch (e) {
      return [];
    }
  }

  function isToolFavorite(url) {
    const favorites = getFavorites();
    return favorites.some(t => t.url === url);
  }

  function toggleFavorite(name, url) {
    try {
      let favorites = getFavorites();
      const index = favorites.findIndex(t => t.url === url);
      
      if (index > -1) {
        favorites.splice(index, 1);
      } else {
        favorites.push({ name, url });
      }
      
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  }

  // 9. Share Tool Feature
  function initShareButtons() {
    // Only on tool pages
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
      return;
    }

    const toolHeader = document.querySelector('.tool-header');
    if (!toolHeader) return;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'share-buttons';
    shareContainer.style.cssText = `
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    `;

    const toolUrl = window.location.href;
    const toolTitle = document.querySelector('.tool-title')?.textContent || '24ToolHub Tool';
    const shareText = `Check out this tool: ${toolTitle}`;

    const shareOptions = [
      {
        name: 'Twitter',
        icon: '🐦',
        action: () => {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(toolUrl)}`, '_blank');
        }
      },
      {
        name: 'Facebook',
        icon: '📘',
        action: () => {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(toolUrl)}`, '_blank');
        }
      },
      {
        name: 'Copy Link',
        icon: '🔗',
        action: () => {
          navigator.clipboard.writeText(toolUrl).then(() => {
            if (window.Utils && window.Utils.showNotification) {
              window.Utils.showNotification('Link copied to clipboard!', 'success');
            } else {
              alert('Link copied to clipboard!');
            }
          });
        }
      }
    ];

    shareOptions.forEach(option => {
      const button = document.createElement('button');
      button.className = 'share-btn';
      button.innerHTML = `${option.icon} ${option.name}`;
      button.style.cssText = `
        padding: 0.5rem 1rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--text-primary);
        transition: all 0.2s ease;
      `;
      button.addEventListener('click', option.action);
      button.addEventListener('mouseenter', () => {
        button.style.background = 'var(--accent-primary)';
        button.style.color = 'white';
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = 'var(--bg-secondary)';
        button.style.color = 'var(--text-primary)';
      });
      shareContainer.appendChild(button);
    });

    toolHeader.appendChild(shareContainer);
  }

  // 10. Tooltips & Help Text
  function initTooltips() {
    // Add tooltips to tool cards on homepage
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
      document.querySelectorAll('.tool-card').forEach(card => {
        const description = card.querySelector('.tool-card-description');
        if (description) {
          card.setAttribute('title', description.textContent);
          card.style.cursor = 'pointer';
        }
      });
    }
  }

  // 11. Empty States
  function initEmptyStates() {
    // Only on homepage with search
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
      return;
    }

    // This will be handled by search functionality
    // Add empty state message when no results found
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      // Empty state will be shown by search manager
      // We can enhance it here if needed
    }
  }

  // Helper: Create tool card
  function createToolCard(tool) {
    const card = document.createElement('a');
    card.href = tool.url;
    card.className = 'tool-card';
    card.innerHTML = `
      <h3 class="tool-card-title">${tool.name}</h3>
    `;
    return card;
  }

})();

