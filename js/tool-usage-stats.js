// Tool Usage Statistics
// Display usage count on tool cards

(function() {
  'use strict';

  // Get usage count for a tool
  function getUsageCount(toolUrl) {
    try {
      const stats = JSON.parse(localStorage.getItem('toolUsageStats') || '{}');
      const tool = stats[toolUrl];
      return tool ? tool.count : 0;
    } catch (e) {
      return 0;
    }
  }

  // Format usage count
  function formatUsageCount(count) {
    if (count === 0) return '';
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
    return (count / 1000000).toFixed(1) + 'M';
  }

  // Add usage badge to tool card
  function addUsageBadge(card) {
    const url = card.getAttribute('href');
    if (!url) return;

    const count = getUsageCount(url);
    if (count === 0) return;

    // Check if badge already exists
    if (card.querySelector('.usage-badge')) return;

    const badge = document.createElement('span');
    badge.className = 'usage-badge';
    badge.textContent = formatUsageCount(count);
    badge.setAttribute('data-en', `${count} uses`);
    badge.setAttribute('data-ar', `${count} استخدام`);
    badge.title = `${count} ${window.LanguageManager?.currentLang === 'ar' ? 'استخدام' : 'uses'}`;

    // Add badge to card
    const title = card.querySelector('.tool-card-title');
    if (title) {
      title.style.position = 'relative';
      title.appendChild(badge);
    }
  }

  // Add usage badges to all tool cards
  function addUsageBadges() {
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
      addUsageBadge(card);
    });
  }

  // Track tool click
  function trackToolClick(card) {
    const url = card.getAttribute('href');
    if (!url) return;

    const title = card.querySelector('.tool-card-title')?.textContent || '';
    
    if (window.trackToolUsage) {
      window.trackToolUsage(title, url);
    }

    // Update badge after tracking
    setTimeout(() => {
      const badge = card.querySelector('.usage-badge');
      if (badge) {
        const newCount = getUsageCount(url);
        badge.textContent = formatUsageCount(newCount);
        badge.title = `${newCount} ${window.LanguageManager?.currentLang === 'ar' ? 'استخدام' : 'uses'}`;
      } else {
        addUsageBadge(card);
      }
    }, 100);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addUsageBadges();
      
      // Track clicks
      document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => trackToolClick(card));
      });
    });
  } else {
    addUsageBadges();
    
    // Track clicks
    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => trackToolClick(card));
    });
  }

  // Re-add badges when new cards are added
  const observer = new MutationObserver(() => {
    addUsageBadges();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Add CSS for usage badge
  const style = document.createElement('style');
  style.textContent = `
    .usage-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--accent-primary, #667eea);
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1;
    }
    .tool-card-title {
      position: relative;
    }
  `;
  document.head.appendChild(style);

  console.log('Tool usage statistics initialized');
})();

