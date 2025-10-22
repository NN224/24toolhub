// Background Remover Logic
;(() => {
  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');
  const comparisonContainer = document.getElementById('comparisonContainer');
  const originalImg = document.getElementById('originalImg');
  const processedImg = document.getElementById('processedImg');
  const processingOverlay = document.getElementById('processingOverlay');

  let currentFile = null;
  let processedBlob = null;

  // Process file
  async function processFile(file) {
    if (!file.type.match(/image\/(jpeg|png)/)) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Please select a valid image (JPEG or PNG)', 'error');
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('File size must be less than 5MB', 'error');
      }
      return;
    }

    currentFile = file;

    // Show original
    const reader = new FileReader();
    reader.onload = async (e) => {
      originalImg.src = e.target.result;
      comparisonContainer.classList.add('active');
      
      // Wait for image to load
      originalImg.onload = async () => {
        processingOverlay.classList.add('active');
        
        try {
          await removeBackgroundAuto(originalImg);
        } catch (error) {
          console.error('Processing error:', error);
          if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification('Failed to process image', 'error');
          }
        } finally {
          processingOverlay.classList.remove('active');
        }
      };
    };
    reader.readAsDataURL(file);
  }

  // Auto background removal (simplified edge detection)
  async function removeBackgroundAuto(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple background detection (checks corners for dominant color)
    const corners = [
      data.slice(0, 4), // top-left
      data.slice((canvas.width - 1) * 4, (canvas.width - 1) * 4 + 4), // top-right
      data.slice((canvas.height - 1) * canvas.width * 4, (canvas.height - 1) * canvas.width * 4 + 4), // bottom-left
      data.slice(((canvas.height - 1) * canvas.width + canvas.width - 1) * 4, ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 4) // bottom-right
    ];

    // Get average background color
    const bgColor = {
      r: Math.round((corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4),
      g: Math.round((corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4),
      b: Math.round((corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4)
    };

    // Remove similar colors
    const threshold = 30; // Color similarity threshold
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate color difference
      const diff = Math.sqrt(
        Math.pow(r - bgColor.r, 2) +
        Math.pow(g - bgColor.g, 2) +
        Math.pow(b - bgColor.b, 2)
      );
      
      // Make transparent if similar to background
      if (diff < threshold) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }

    ctx.putImageData(imageData, 0, 0);
    
    // Convert to blob and display
    canvas.toBlob((blob) => {
      processedBlob = blob;
      processedImg.src = URL.createObjectURL(blob);
      
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Background removed successfully!', 'success');
      }
    }, 'image/png');
  }


  // Download processed image
  window.downloadImage = function() {
    if (!processedBlob) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('No processed image available', 'error');
      }
      return;
    }

    const url = URL.createObjectURL(processedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bg-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (window.Utils && window.Utils.showNotification) {
      window.Utils.showNotification('Image downloaded successfully!', 'success');
    }
  };

  // Reset tool
  window.resetTool = function() {
    fileInput.value = '';
    currentFile = null;
    processedBlob = null;
    comparisonContainer.classList.remove('active');
  };

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '';
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  });
})();
