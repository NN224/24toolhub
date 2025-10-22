// Image Compressor Logic
;(() => {
  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');
  const qualityControl = document.getElementById('qualityControl');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityDisplay = document.getElementById('qualityDisplay');
  const comparisonContainer = document.getElementById('comparisonContainer');
  
  const originalImg = document.getElementById('originalImg');
  const compressedImg = document.getElementById('compressedImg');
  const originalSize = document.getElementById('originalSize');
  const compressedSize = document.getElementById('compressedSize');
  const savedSize = document.getElementById('savedSize');
  const savingsPercent = document.getElementById('savingsPercent');
  const originalDimensions = document.getElementById('originalDimensions');
  const originalFormat = document.getElementById('originalFormat');

  let currentFile = null;
  let compressedBlob = null;

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Compress image
  async function compressImage(file, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          // Get file type
          const mimeType = file.type || 'image/jpeg';
          
          canvas.toBlob(
            (blob) => {
              resolve({
                blob,
                dataUrl: canvas.toDataURL(mimeType, quality / 100),
                width: img.width,
                height: img.height,
                format: mimeType.split('/')[1].toUpperCase()
              });
            },
            mimeType,
            quality / 100
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Process file
  async function processFile(file) {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Please select a valid image file (JPEG, PNG, or WebP)', 'error');
      } else {
        alert('Please select a valid image file');
      }
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('File size must be less than 10MB', 'error');
      } else {
        alert('File size must be less than 10MB');
      }
      return;
    }

    currentFile = file;

    // Show controls
    qualityControl.style.display = 'block';
    comparisonContainer.style.display = 'grid';

    // Display original
    const reader = new FileReader();
    reader.onload = (e) => {
      originalImg.src = e.target.result;
      originalSize.textContent = formatFileSize(file.size);
      
      const img = new Image();
      img.onload = () => {
        originalDimensions.textContent = `${img.width} x ${img.height}`;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    originalFormat.textContent = file.type.split('/')[1].toUpperCase();

    // Compress
    await updateCompression();
  }

  // Update compression
  async function updateCompression() {
    if (!currentFile) return;

    const quality = parseInt(qualitySlider.value);
    
    try {
      const result = await compressImage(currentFile, quality);
      
      compressedBlob = result.blob;
      compressedImg.src = result.dataUrl;
      compressedSize.textContent = formatFileSize(result.blob.size);
      
      const saved = currentFile.size - result.blob.size;
      const percent = Math.round((saved / currentFile.size) * 100);
      
      savedSize.textContent = formatFileSize(saved);
      savingsPercent.textContent = `${percent}% reduction`;
      
      if (percent > 0) {
        savingsPercent.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      } else {
        savingsPercent.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      }
      
    } catch (error) {
      console.error('Compression error:', error);
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Failed to compress image', 'error');
      }
    }
  }

  // Download compressed image
  window.downloadCompressed = function() {
    if (!compressedBlob) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('No compressed image available', 'error');
      }
      return;
    }

    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${currentFile.name}`;
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
    compressedBlob = null;
    qualityControl.style.display = 'none';
    comparisonContainer.style.display = 'none';
    qualitySlider.value = 80;
    qualityDisplay.textContent = '80';
  };

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  });

  // Quality slider change
  qualitySlider.addEventListener('input', (e) => {
    qualityDisplay.textContent = e.target.value;
  });

  qualitySlider.addEventListener('change', () => {
    updateCompression();
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  });
})();
