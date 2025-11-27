// QR Code Generator Tool Logic
;(() => {
  // Wait for QRCode library to load (qrcodejs uses QRCode as global)
  function waitForQRCode(callback) {
    if (typeof QRCode !== 'undefined') {
      callback();
    } else {
      // Check if script is loaded
      const script = document.querySelector('script[src*="qrcode"]');
      if (script) {
        script.addEventListener('load', () => {
          // Wait a bit for QRCode to be available
          setTimeout(() => {
            if (typeof QRCode !== 'undefined') {
              callback();
            } else {
              console.error('QRCode library loaded but QRCode is undefined');
              setTimeout(() => waitForQRCode(callback), 200);
            }
          }, 100);
        });
        script.addEventListener('error', () => {
          console.error('Failed to load QRCode library');
          alert('Failed to load QR code library. Please refresh the page.');
        });
      } else {
        // Try again after a short delay
        setTimeout(() => waitForQRCode(callback), 100);
      }
    }
  }

  // Wait for both DOM and library to be ready
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        waitForQRCode(() => {
          initQRGenerator();
        });
      });
    } else {
      waitForQRCode(() => {
        initQRGenerator();
      });
    }
    
    // Fallback: try again after delays
    setTimeout(() => {
      if (typeof QRCode !== 'undefined' && !window.generateQR) {
        waitForQRCode(() => {
          initQRGenerator();
        });
      }
    }, 500);
    
    setTimeout(() => {
      if (typeof QRCode !== 'undefined' && !window.generateQR) {
        waitForQRCode(() => {
          initQRGenerator();
        });
      }
    }, 2000);
  }

  initWhenReady();

  function initQRGenerator() {
    const contentType = document.getElementById("contentType");
    const qrContent = document.getElementById("qrContent");
    const qrSize = document.getElementById("qrSize");
    const errorLevel = document.getElementById("errorLevel");
    const qrOutput = document.getElementById("qrOutput");
    const qrCodeContainer = document.getElementById("qrCodeContainer");
    const downloadBtn = document.getElementById("downloadBtn");

    if (!contentType || !qrContent || !qrSize || !errorLevel || !qrOutput || !qrCodeContainer || !downloadBtn) {
      console.error('QR Code Generator: Missing required elements');
      return;
    }

    let currentQRCodeDataURL = null;

    function generateQR() {
      const content = qrContent.value.trim();
      const size = parseInt(qrSize.value) || 256;
      const errorCorrectionLevel = errorLevel.value || 'M';

      if (!content) {
        qrOutput.style.display = "none";
        if (downloadBtn) downloadBtn.disabled = true;
        return;
      }

      // Check if QRCode is available
      if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        qrCodeContainer.innerHTML = '<p style="color: var(--error, #ef4444);">QR Code library not loaded. Please refresh the page.</p>';
        qrOutput.style.display = "block";
        return;
      }

      try {
        // Clear previous QR code
        qrCodeContainer.innerHTML = "";

        // qrcodejs uses different API - create QRCode instance
        const qr = new QRCode(qrCodeContainer, {
          text: content,
          width: size,
          height: size,
          colorDark: '#000000',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel[errorCorrectionLevel] || QRCode.CorrectLevel.M
        });

        // Wait for QR code to be generated, then get the canvas
        setTimeout(() => {
          const canvas = qrCodeContainer.querySelector('canvas');
          if (canvas) {
            // Get data URL from canvas
            currentQRCodeDataURL = canvas.toDataURL('image/png');
            if (downloadBtn) downloadBtn.disabled = false;
            qrOutput.style.display = "block";
            
            // Ensure image is visible
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
          } else {
            console.error('QR Code canvas not found');
            qrCodeContainer.innerHTML = '<p style="color: var(--error, #ef4444);">Error generating QR code canvas.</p>';
            qrOutput.style.display = "block";
            if (downloadBtn) downloadBtn.disabled = true;
          }
        }, 100);

      } catch (error) {
        console.error('QR Code generation error:', error);
        qrCodeContainer.innerHTML = '<p style="color: var(--error, #ef4444);">Error generating QR code: ' + error.message + '</p>';
        qrOutput.style.display = "block";
        if (downloadBtn) downloadBtn.disabled = true;
      }
    }

    function updatePlaceholder() {
      const type = contentType.value;
      const placeholders = {
        'text': 'Enter any text content...',
        'url': 'https://example.com',
        'email': 'contact@example.com',
        'phone': '+1234567890',
        'sms': '+1234567890:Your message here',
        'wifi': 'WIFI:T:WPA;S:NetworkName;P:Password;H:false;;',
        'vcard': 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD'
      };
      
      qrContent.placeholder = placeholders[type] || 'Enter the content for your QR code...';
    }

    // Auto-generate on input change
    if (qrContent) {
      const debouncedGenerate = window.Utils ? window.Utils.debounce(generateQR, 500) : generateQR;
      qrContent.addEventListener("input", debouncedGenerate);
    }

    if (contentType) {
      contentType.addEventListener("change", () => {
        updatePlaceholder();
        generateQR(); // Regenerate when type changes
      });
      updatePlaceholder(); // Set initial placeholder
    }

    if (qrSize) {
      qrSize.addEventListener("change", generateQR);
    }

    if (errorLevel) {
      errorLevel.addEventListener("change", generateQR);
    }

    // Global functions for buttons - make sure they're available immediately
    window.generateQR = generateQR;
    window.clearQR = clearQR;
    window.downloadQR = downloadQR;

    function clearQR() {
      qrContent.value = "";
      qrOutput.style.display = "none";
      qrCodeContainer.innerHTML = "";
      if (downloadBtn) downloadBtn.disabled = true;
      currentQRCodeDataURL = null;
    }

    function downloadQR() {
      if (!currentQRCodeDataURL) {
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("No QR code to download");
        } else {
          alert("No QR code to download");
        }
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = currentQRCodeDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification("QR code downloaded successfully!");
      }
    }

    // Don't generate on initial load (wait for user input)
    // generateQR();
    
    console.log('QR Code Generator initialized successfully');
  }
})();
