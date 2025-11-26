// Enhanced Search using Fuse.js
// Fuzzy search for better search results

(function() {
  'use strict';

  // Check if Fuse.js is available
  if (typeof Fuse === 'undefined') {
    console.warn('Fuse.js is not loaded. Falling back to basic search.');
    return;
  }

  // Build search index from tool cards
  function buildSearchIndex() {
    const toolCards = document.querySelectorAll('.tool-card');
    const tools = [];

    toolCards.forEach((card, index) => {
      const title = card.querySelector('.tool-card-title')?.textContent || '';
      const description = card.querySelector('.tool-card-description')?.textContent || '';
      const category = card.closest('.tools-section')?.dataset.category || 'all';
      const url = card.getAttribute('href') || '';

      if (title) {
        tools.push({
          id: index,
          title: title.trim(),
          description: description.trim(),
          category: category,
          url: url,
          keywords: `${title} ${description}`.toLowerCase()
        });
      }
    });

    return tools;
  }

  // Initialize Fuse.js
  let fuse = null;
  let toolsIndex = [];

  function initFuse() {
    toolsIndex = buildSearchIndex();
    
    fuse = new Fuse(toolsIndex, {
      keys: ['title', 'description', 'keywords'],
      threshold: 0.3, // 0.0 = exact match, 1.0 = match anything
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      ignoreLocation: true
    });
  }

  // Enhanced search function
  function enhancedSearch(query) {
    if (!fuse) {
      initFuse();
    }

    if (!query || query.trim().length < 2) {
      return toolsIndex; // Return all tools if query is too short
    }

    const results = fuse.search(query.trim());
    return results.map(result => result.item);
  }

  // Integrate with existing SearchManager
  if (window.SearchManager) {
    const originalFilterTools = window.SearchManager.filterTools;
    
    window.SearchManager.filterTools = function(query) {
      const lowerQuery = query.toLowerCase();
      
      // Use Fuse.js for fuzzy search
      const results = enhancedSearch(lowerQuery);
      const resultUrls = new Set(results.map(tool => tool.url));

      // Hide/show tool cards based on results
      const toolCards = document.querySelectorAll('.tool-card');
      let visibleCount = 0;

      toolCards.forEach((card) => {
        const cardUrl = card.getAttribute('href');
        if (resultUrls.has(cardUrl) || lowerQuery.length < 2) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Show empty state
      this.showEmptyState(visibleCount === 0 && query.length >= 2, query);
    };
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFuse);
  } else {
    initFuse();
  }

  // Rebuild index when tools are added dynamically
  window.rebuildSearchIndex = initFuse;

  console.log('Enhanced search initialized with Fuse.js');
})();

