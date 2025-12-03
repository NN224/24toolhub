// Base64 Encoder/Decoder Tool Logic
;(() => {
  document.addEventListener("DOMContentLoaded", () => {
    let currentMode = "encode"
    const inputText = document.getElementById("inputText")
    const outputText = document.getElementById("outputText")

    window.updateMode = () => {
      currentMode = document.querySelector('input[name="mode"]:checked').value
      
      // Track mode change
      if (window.trackToolUsage) {
        window.trackToolUsage('Base64 Encoder/Decoder', `mode_change_${currentMode}`);
      }
      
      processText()
    }

    if (inputText) {
      const debouncedProcess = window.Utils ? window.Utils.debounce(processText, 300) : processText

      inputText.addEventListener("input", debouncedProcess)
    }

    async function processText() {
      const input = inputText.value
      const output = outputText

      if (!input) {
        output.value = ""
        return
      }

      try {
        // Warn for large data
        if (input.length > 100000 && window.Utils) {
          window.Utils.warnLargeData(input.length)
          window.Utils.showLoadingIndicator()
        }

        // Process with delay for large data to avoid UI freeze
        if (input.length > 100000) {
          await new Promise((resolve) => setTimeout(resolve, 0))
        }

        if (currentMode === "encode") {
          output.value = btoa(unescape(encodeURIComponent(input)))
        } else {
          output.value = decodeURIComponent(escape(atob(input)))
        }

        // Track successful processing
        if (window.trackToolUsage) {
          window.trackToolUsage('Base64 Encoder/Decoder', `${currentMode}_success`);
        }

        if (window.Utils) {
          window.Utils.hideLoadingIndicator()
        }
      } catch (e) {
        const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : "en"
        const errorMsg =
          lang === "en"
            ? `Error: Invalid input for ${currentMode}`
            : `خطأ: إدخال غير صالح لـ ${currentMode === "encode" ? "التشفير" : "فك التشفير"}`

        output.value = errorMsg

        // Track error
        if (window.trackError) {
          window.trackError(`Base64 ${currentMode} error: ${e.message}`, 'base64-encoder');
        }

        if (window.Utils) {
          window.Utils.hideLoadingIndicator()
        }
      }
    }

    window.copyOutput = () => {
      const output = outputText
      const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : "en"

      if (!output.value) {
        const msg = lang === "en" ? "Nothing to copy" : "لا يوجد شيء للنسخ"
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification(msg)
        }
        return
      }

      if (window.Utils && window.Utils.copyToClipboard) {
        window.Utils.copyToClipboard(output.value)
      } else {
        output.select()
        document.execCommand("copy")
        const msg = lang === "en" ? "Copied to clipboard!" : "تم النسخ إلى الحافظة!"
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification(msg, 'success');
        } else {
          alert(msg);
        }
      }

      // Track copy action
      if (window.trackToolUsage) {
        window.trackToolUsage('Base64 Encoder/Decoder', 'copy_output');
      }
    }

    window.clearAll = () => {
      inputText.value = ""
      outputText.value = ""
      
      // Track clear action
      if (window.trackToolUsage) {
        window.trackToolUsage('Base64 Encoder/Decoder', 'clear_all');
      }
    }

    // Initialize FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Close all other FAQ items
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // Toggle current FAQ item
            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
  })
})()
