// YouTube Thumbnail Downloader Logic
;(() => {
  const videoUrl = document.getElementById('videoUrl');
  const thumbnailsContainer = document.getElementById('thumbnailsContainer');
  const videoPreview = document.getElementById('videoPreview');
  const videoIdDisplay = document.getElementById('videoId');

  // Extract video ID from YouTube URL
  function extractVideoId(url) {
    if (!url) return null;

    // Remove whitespace
    url = url.trim();

    // Try different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/  // Just the video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  // Get thumbnail URL for different qualities
  function getThumbnailUrl(videoId, quality) {
    const baseUrl = 'https://img.youtube.com/vi';
    
    switch(quality) {
      case 'maxres':
        return `${baseUrl}/${videoId}/maxresdefault.jpg`;
      case 'sd':
        return `${baseUrl}/${videoId}/sddefault.jpg`;
      case 'hq':
        return `${baseUrl}/${videoId}/hqdefault.jpg`;
      case 'mq':
        return `${baseUrl}/${videoId}/mqdefault.jpg`;
      case 'default':
        return `${baseUrl}/${videoId}/default.jpg`;
      default:
        return `${baseUrl}/${videoId}/hqdefault.jpg`;
    }
  }

  // Download thumbnail
  function downloadThumbnail(url, videoId, quality) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-thumbnail-${videoId}-${quality}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.Utils && window.Utils.showNotification) {
      window.Utils.showNotification('Thumbnail download started!', 'success');
    }
  }

  // Check if image exists (some videos don't have all qualities)
  function checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Display thumbnails
  async function displayThumbnails(videoId) {
    const qualities = [
      { name: 'maxres', label: 'Maximum Resolution', resolution: '1280 x 720' },
      { name: 'sd', label: 'Standard Definition', resolution: '640 x 480' },
      { name: 'hq', label: 'High Quality', resolution: '480 x 360' },
      { name: 'mq', label: 'Medium Quality', resolution: '320 x 180' },
      { name: 'default', label: 'Default', resolution: '120 x 90' }
    ];

    thumbnailsContainer.innerHTML = '<div class="thumbnail-grid"></div>';
    const grid = thumbnailsContainer.querySelector('.thumbnail-grid');

    for (const quality of qualities) {
      const url = getThumbnailUrl(videoId, quality.name);
      const exists = await checkImageExists(url);

      if (exists) {
        const card = document.createElement('div');
        card.className = 'thumbnail-card';
        card.innerHTML = `
          <div class="thumbnail-quality">${quality.label}</div>
          <div class="thumbnail-resolution">${quality.resolution}</div>
          <img src="${url}" alt="${quality.label} thumbnail" loading="lazy">
          <button class="download-btn" onclick="downloadThumbnail('${url}', '${videoId}', '${quality.name}')">
            📥 Download ${quality.label}
          </button>
        `;
        grid.appendChild(card);
      }
    }

    // Show video preview
    videoPreview.classList.add('active');
    videoIdDisplay.textContent = videoId;
  }

  // Main function to get thumbnails
  window.getThumbnails = async function() {
    const url = videoUrl.value;

    if (!url) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Please enter a YouTube video URL', 'error');
      } else {
        alert('Please enter a YouTube video URL');
      }
      return;
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Invalid YouTube URL. Please check and try again.', 'error');
      } else {
        alert('Invalid YouTube URL. Please check and try again.');
      }
      return;
    }

    // Show loading
    if (window.Utils && window.Utils.showNotification) {
      window.Utils.showNotification('Loading thumbnails...', 'info');
    }

    await displayThumbnails(videoId);
  };

  // Clear all
  window.clearAll = function() {
    videoUrl.value = '';
    thumbnailsContainer.innerHTML = '';
    videoPreview.classList.remove('active');
  };

  // Use example
  window.useExample = function(videoId) {
    videoUrl.value = `https://www.youtube.com/watch?v=${videoId}`;
    window.getThumbnails();
  };

  // Make downloadThumbnail globally accessible
  window.downloadThumbnail = downloadThumbnail;

  // Auto-detect on paste
  videoUrl.addEventListener('paste', () => {
    setTimeout(() => {
      window.getThumbnails();
    }, 100);
  });

  // Enter key support
  videoUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      window.getThumbnails();
    }
  });
})();
