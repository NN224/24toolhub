// SortableJS Initialization
// Enable drag & drop sorting for favorites and recent tools

(function() {
  'use strict';

  // Check if SortableJS is available
  if (typeof Sortable === 'undefined') {
    console.warn('SortableJS is not loaded. Drag & drop will not work.');
    return;
  }

  // Initialize sortable for favorites
  function initFavoritesSortable() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;

    const sortable = new Sortable(favoritesGrid, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: function(evt) {
        // Save new order to localStorage
        const items = Array.from(favoritesGrid.children);
        const favorites = items.map(item => {
          const url = item.getAttribute('href');
          const name = item.querySelector('.tool-card-title')?.textContent || '';
          return { name, url };
        });

        try {
          localStorage.setItem('favorites', JSON.stringify(favorites));
        } catch (e) {
          console.error('Failed to save favorites order:', e);
        }
      }
    });

    return sortable;
  }

  // Initialize sortable for recent tools
  function initRecentToolsSortable() {
    const recentGrid = document.getElementById('recentToolsGrid');
    if (!recentGrid) return;

    const sortable = new Sortable(recentGrid, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: function(evt) {
        // Save new order to localStorage
        const items = Array.from(recentGrid.children);
        const recent = items.map(item => {
          const url = item.getAttribute('href');
          const name = item.querySelector('.tool-card-title')?.textContent || '';
          return { name, url };
        });

        try {
          localStorage.setItem('recentTools', JSON.stringify(recent.slice(0, 10)));
        } catch (e) {
          console.error('Failed to save recent tools order:', e);
        }
      }
    });

    return sortable;
  }

  // Initialize on DOM ready
  function initSortables() {
    initFavoritesSortable();
    initRecentToolsSortable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSortables);
  } else {
    initSortables();
  }

  // Re-initialize when sections are added dynamically
  const observer = new MutationObserver(() => {
    initSortables();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Add CSS for sortable effects
  const style = document.createElement('style');
  style.textContent = `
    .sortable-ghost {
      opacity: 0.4;
    }
    .sortable-chosen {
      cursor: grabbing;
    }
    .sortable-drag {
      opacity: 0.8;
    }
    .tools-grid .tool-card {
      cursor: grab;
    }
    .tools-grid .tool-card:active {
      cursor: grabbing;
    }
  `;
  document.head.appendChild(style);

  console.log('SortableJS initialized for drag & drop');
})();

