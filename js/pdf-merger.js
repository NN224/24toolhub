// PDF Merger Logic
;(() => {
  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');
  const filesList = document.getElementById('filesList');
  const emptyState = document.getElementById('emptyState');
  const mergeBtn = document.getElementById('mergeBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');

  let pdfFiles = [];
  let draggedIndex = null;

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Add files
  function addFiles(files) {
    const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');

    if (validFiles.length === 0) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Please select PDF files only', 'error');
      } else {
        alert('Please select PDF files only');
      }
      return;
    }

    pdfFiles.push(...validFiles);
    updateFilesList();
    updateMergeButton();
  }

  // Update files list
  function updateFilesList() {
    if (pdfFiles.length === 0) {
      emptyState.style.display = 'block';
      filesList.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    filesList.style.display = 'block';

    filesList.innerHTML = pdfFiles.map((file, index) => `
      <div class="file-item" draggable="true" data-index="${index}">
        <span class="drag-handle">⋮⋮</span>
        <div class="file-icon">📄</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <div class="file-actions">
          <button class="btn-icon btn-remove" onclick="removeFile(${index})" title="Remove">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    // Add drag and drop listeners
    document.querySelectorAll('.file-item').forEach((item, index) => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragend', handleDragEnd);
    });
  }

  // Remove file
  window.removeFile = function(index) {
    pdfFiles.splice(index, 1);
    updateFilesList();
    updateMergeButton();
  };

  // Update merge button state
  function updateMergeButton() {
    mergeBtn.disabled = pdfFiles.length < 2;
  }

  // Drag and drop for reordering
  function handleDragStart(e) {
    draggedIndex = parseInt(e.currentTarget.dataset.index);
    e.currentTarget.style.opacity = '0.5';
  }

  function handleDragOver(e) {
    e.preventDefault();
    return false;
  }

  function handleDrop(e) {
    e.preventDefault();
    const dropIndex = parseInt(e.currentTarget.dataset.index);

    if (draggedIndex !== dropIndex) {
      const draggedFile = pdfFiles[draggedIndex];
      pdfFiles.splice(draggedIndex, 1);
      pdfFiles.splice(dropIndex, 0, draggedFile);
      updateFilesList();
    }

    return false;
  }

  function handleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    draggedIndex = null;
  }

  // Merge PDFs
  window.mergePDFs = async function() {
    if (pdfFiles.length < 2) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Please add at least 2 PDF files', 'error');
      }
      return;
    }

    try {
      mergeBtn.disabled = true;
      progressBar.style.display = 'block';
      progressFill.style.width = '0%';
      progressFill.textContent = '0%';

      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Merging PDFs...', 'info');
      }

      // Create new PDF document
      const mergedPdf = await PDFLib.PDFDocument.create();

      // Process each PDF
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        
        // Update progress
        const progress = Math.round(((i + 1) / pdfFiles.length) * 100);
        progressFill.style.width = progress + '%';
        progressFill.textContent = progress + '%';

        // Read file
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

        // Copy all pages
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // Save merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      // Download
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('PDFs merged successfully!', 'success');
      }

      // Reset after short delay
      setTimeout(() => {
        progressBar.style.display = 'none';
        mergeBtn.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Merge error:', error);
      
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Failed to merge PDFs. Please try again.', 'error');
      } else {
        alert('Failed to merge PDFs. Please try again.');
      }

      progressBar.style.display = 'none';
      mergeBtn.disabled = false;
    }
  };

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  });

  // Drag and drop on upload area
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
    
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  });
})();
