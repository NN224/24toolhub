// Loading States
// Skeleton loaders and progress indicators

(function() {
  'use strict';

  // Create skeleton loader for tool card
  function createSkeletonCard() {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card tool-card';
    skeleton.innerHTML = `
      <div class="skeleton-title"></div>
      <div class="skeleton-description"></div>
      <div class="skeleton-description short"></div>
    `;
    return skeleton;
  }

  // Show skeleton loaders
  function showSkeletons(container, count = 6) {
    if (!container) return;

    // Clear existing skeletons
    const existing = container.querySelectorAll('.skeleton-card');
    existing.forEach(s => s.remove());

    // Add new skeletons
    for (let i = 0; i < count; i++) {
      container.appendChild(createSkeletonCard());
    }
  }

  // Hide skeleton loaders
  function hideSkeletons(container) {
    if (!container) return;
    const skeletons = container.querySelectorAll('.skeleton-card');
    skeletons.forEach(s => s.remove());
  }

  // Show progress bar
  function showProgress(container, percent = 0) {
    if (!container) return;

    let progressBar = container.querySelector('.progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      container.appendChild(progressBar);
    }

    progressBar.style.width = `${percent}%`;
  }

  // Hide progress bar
  function hideProgress(container) {
    if (!container) return;
    const progressBar = container.querySelector('.progress-bar');
    if (progressBar) progressBar.remove();
  }

  // Show loading state for tool cards
  function showToolCardsLoading() {
    const toolsGrid = document.querySelector('.tools-grid');
    if (toolsGrid) {
      showSkeletons(toolsGrid, 6);
    }
  }

  // Hide loading state for tool cards
  function hideToolCardsLoading() {
    const toolsGrid = document.querySelector('.tools-grid');
    if (toolsGrid) {
      hideSkeletons(toolsGrid);
    }
  }

  // Global functions
  window.LoadingStates = {
    showSkeletons,
    hideSkeletons,
    showProgress,
    hideProgress,
    showToolCardsLoading,
    hideToolCardsLoading
  };

  // Add CSS for skeleton loaders
  const style = document.createElement('style');
  style.textContent = `
    .skeleton-card {
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 8px;
      padding: 1.5rem;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      pointer-events: none;
    }

    .skeleton-title {
      height: 24px;
      width: 60%;
      background: linear-gradient(90deg, 
        var(--bg-secondary, #f5f5f5) 0%, 
        var(--bg-tertiary, #e0e0e0) 50%, 
        var(--bg-secondary, #f5f5f5) 100%);
      background-size: 200% 100%;
      border-radius: 4px;
      margin-bottom: 1rem;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-description {
      height: 16px;
      width: 100%;
      background: linear-gradient(90deg, 
        var(--bg-secondary, #f5f5f5) 0%, 
        var(--bg-tertiary, #e0e0e0) 50%, 
        var(--bg-secondary, #f5f5f5) 100%);
      background-size: 200% 100%;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-description.short {
      width: 70%;
    }

    @keyframes skeleton-shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes skeleton-loading {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    .progress-bar {
      height: 4px;
      background: var(--accent-primary, #667eea);
      border-radius: 2px;
      transition: width 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .progress-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255,255,255,0.3), 
        transparent);
      animation: progress-shimmer 1.5s ease-in-out infinite;
    }

    @keyframes progress-shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);

  console.log('Loading states initialized');
})();

