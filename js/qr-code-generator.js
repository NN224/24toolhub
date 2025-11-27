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

    // Update active form based on selection
    function updateActiveForm() {
      const type = contentType.value;
      
      // Hide all forms
      document.querySelectorAll('.type-form').forEach(form => {
        form.style.display = 'none';
      });
      
      // Show active form
      const activeForm = document.getElementById(`form-${type}`);
      if (activeForm) {
        activeForm.style.display = 'block';
      }
      
      // Regenerate QR code
      updateQRContent();
    }

    // Build QR content string from active form inputs
    function updateQRContent() {
      const type = contentType.value;
      let content = '';

      try {
        switch (type) {
          case 'text':
            content = document.getElementById('textInput').value;
            break;
            
          case 'url':
            content = document.getElementById('urlInput').value;
            if (content && !content.startsWith('http://') && !content.startsWith('https://')) {
              content = 'https://' + content;
            }
            break;
            
          case 'email':
            const email = document.getElementById('emailAddress').value;
            const subject = document.getElementById('emailSubject').value;
            const body = document.getElementById('emailBody').value;
            if (email) {
              content = `mailto:${email}`;
              const params = [];
              if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
              if (body) params.push(`body=${encodeURIComponent(body)}`);
              if (params.length > 0) content += `?${params.join('&')}`;
            }
            break;
            
          case 'phone':
            const phone = document.getElementById('phoneInput').value;
            if (phone) content = `tel:${phone}`;
            break;
            
          case 'sms':
            const smsPhone = document.getElementById('smsPhone').value;
            const smsMsg = document.getElementById('smsMessage').value;
            if (smsPhone) {
              content = `sms:${smsPhone}`;
              if (smsMsg) content += `:${smsMsg}`; // Note: Format varies by device, but this is common
            }
            break;
            
          case 'wifi':
            const ssid = document.getElementById('wifiSSID').value;
            const password = document.getElementById('wifiPassword').value;
            const encryption = document.getElementById('wifiEncryption').value;
            const hidden = document.getElementById('wifiHidden').checked;
            
            if (ssid) {
              content = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;
            }
            break;
            
          case 'vcard':
            const first = document.getElementById('vcardFirst').value;
            const last = document.getElementById('vcardLast').value;
            const org = document.getElementById('vcardOrg').value;
            const tel = document.getElementById('vcardPhone').value;
            const vEmail = document.getElementById('vcardEmail').value;
            const url = document.getElementById('vcardUrl').value;
            const addr = document.getElementById('vcardAddress').value;
            
            if (first || last || org) {
              content = `BEGIN:VCARD\nVERSION:3.0\nN:${last};${first};;;\nFN:${first} ${last}\nORG:${org}\nTEL:${tel}\nEMAIL:${vEmail}\nURL:${url}\nADR:;;${addr};;;;\nEND:VCARD`;
            }
            break;
        }
      } catch (e) {
        console.error('Error building QR content:', e);
      }

      qrContent.value = content;
      
      // Debounced generation
      if (window.Utils && window.Utils.debounce) {
        // We use the global debounced function if available, but since we're calling this 
        // from input events, we need to manage the debounce here or in the event listener
        // For simplicity, we'll just call generateQR() which we can debounce in the listener
        generateQR();
      } else {
        // Simple debounce
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(generateQR, 300);
      }
    }

    function generateQR() {
      const content = qrContent.value.trim();
      const size = parseInt(qrSize.value) || 300;
      const errorCorrectionLevel = errorLevel.value || 'M';

      if (!content) {
        qrOutput.style.display = "none";
        if (downloadBtn) downloadBtn.disabled = true;
        return;
      }

      // Check if QRCode is available
      if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
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
            
            // Ensure image is visible and responsive
            const img = qrCodeContainer.querySelector('img');
            if (img) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block'; // Ensure block display
            }
            canvas.style.display = 'none'; // Hide canvas, show img (qrcode.js creates both)
            if (img) img.style.display = 'block';
            
          } else {
            // Sometimes qrcode.js only creates img tag directly (older browsers or settings)
            const img = qrCodeContainer.querySelector('img');
             if (img) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                if (img.src) {
                   currentQRCodeDataURL = img.src;
                   if (downloadBtn) downloadBtn.disabled = false;
                   qrOutput.style.display = "block";
                }
             }
          }
        }, 100);

      } catch (error) {
        console.error('QR Code generation error:', error);
        qrCodeContainer.innerHTML = '<p style="color: var(--error, #ef4444);">Error generating QR code.</p>';
        qrOutput.style.display = "block";
      }
    }

    // Attach event listeners to all form inputs
    const formInputs = document.querySelectorAll('#inputForms input, #inputForms textarea, #inputForms select');
    formInputs.forEach(input => {
      input.addEventListener('input', updateQRContent);
      input.addEventListener('change', updateQRContent); // For selects/checkboxes
    });

    if (contentType) {
      contentType.addEventListener("change", () => {
        updateActiveForm();
      });
    }

    if (qrSize) {
      qrSize.addEventListener("change", generateQR);
    }

    if (errorLevel) {
      errorLevel.addEventListener("change", generateQR);
    }

    // Global functions for buttons
    window.generateQR = generateQR;
    window.clearQR = clearQR;
    window.downloadQR = downloadQR;

    function clearQR() {
      // Clear all inputs
      document.querySelectorAll('#inputForms input, #inputForms textarea').forEach(input => {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
      });
      
      qrContent.value = "";
      qrOutput.style.display = "none";
      qrCodeContainer.innerHTML = "";
      if (downloadBtn) downloadBtn.disabled = true;
      currentQRCodeDataURL = null;
    }

    function downloadQR() {
      if (!currentQRCodeDataURL) return;

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

    // Initialize
    updateActiveForm();
    
    console.log('QR Code Generator initialized successfully');
  }
})();
