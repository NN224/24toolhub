// 24ToolHub - Main JavaScript File

// Language Management
const LanguageManager = {
  currentLang: localStorage.getItem("language") || "en",

  init() {
    this.updatePageLanguage()
    this.setupLanguageSwitcher()
  },

  updatePageLanguage() {
    document.documentElement.lang = this.currentLang
    document.body.dir = this.currentLang === "ar" ? "rtl" : "ltr"

    // Update all translatable elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n")
      const translation = this.getTranslation(key)
      if (translation) {
        element.textContent = translation
      }

    })

    // Update all translatable elements with data-en/data-ar
    document.querySelectorAll("[data-en], [data-ar]").forEach((element) => {
      const enText = element.getAttribute("data-en")
      const arText = element.getAttribute("data-ar")
      
      if (enText && arText) {
        element.textContent = this.currentLang === "ar" ? arText : enText
      }
    })

    // Update placeholder attributes
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder")
      const translation = this.getTranslation(key)
      if (translation) {
        element.placeholder = translation
      }
    })

    // Update placeholder attributes with data-en-placeholder/data-ar-placeholder
    document.querySelectorAll("[data-en-placeholder], [data-ar-placeholder]").forEach((element) => {
      const enPlaceholder = element.getAttribute("data-en-placeholder")
      const arPlaceholder = element.getAttribute("data-ar-placeholder")
      
      if (enPlaceholder && arPlaceholder) {
        element.placeholder = this.currentLang === "ar" ? arPlaceholder : enPlaceholder
      }
    })

    // Update language switcher button
    const langBtn = document.getElementById("langSwitcher")
    if (langBtn) {
      langBtn.textContent = this.currentLang === "en" ? "العربية" : "English"
    }
  },

  setupLanguageSwitcher() {
    const langBtn = document.getElementById("langSwitcher")
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        this.currentLang = this.currentLang === "en" ? "ar" : "en"
        localStorage.setItem("language", this.currentLang)
        this.updatePageLanguage()
      })
    }
  },

  getTranslation(key) {
    const translations = {
      en: {
        "site.title": "24ToolHub",
        "site.tagline": "Free Online Tools - Available 24/7",
        "nav.home": "Home",
        "nav.tools": "Tools",
        "nav.about": "About",
        "nav.contact": "Contact",
        "search.placeholder": "Search tools...",
        "category.all": "All Tools",
        "category.text": "Text & String",
        "category.conversion": "Conversion & Calculator",
        "category.generator": "Generator & Formatter",
        "category.encoder": "Encoder & Crypto",
        "category.analysis": "Website Analysis",
        "category.utility": "Utility & Misc",
        "footer.copyright": "© 2025 24ToolHub. All rights reserved.",
        "footer.built": "BUILT BY NNH - AI STUDIO",
        "btn.copy": "Copy",
        "btn.clear": "Clear",
        "btn.download": "Download",
        "btn.back": "Back to Home",
        "btn.generate": "Generate",
        "btn.convert": "Convert",
        "btn.process": "Process",
        "btn.calculate": "Calculate",
        "input.placeholder": "Enter text here...",
        "output.placeholder": "Output will appear here...",
        "stats.words": "Words",
        "stats.characters": "Characters",
        "stats.sentences": "Sentences",
        "stats.paragraphs": "Paragraphs",
        "tool.schemaGenerator": "Schema Generator",
      },
      ar: {
        "site.title": "24 أداة هب",
        "site.tagline": "أدوات مجانية على الإنترنت - متاحة 24/7",
        "nav.home": "الرئيسية",
        "nav.tools": "الأدوات",
        "nav.about": "عن الموقع",
        "nav.contact": "اتصل بنا",
        "search.placeholder": "ابحث عن الأدوات...",
        "category.all": "جميع الأدوات",
        "category.text": "النصوص والسلاسل",
        "category.conversion": "التحويل والحاسبات",
        "category.generator": "المولدات والمنسقات",
        "category.encoder": "التشفير والترميز",
        "category.analysis": "تحليل المواقع",
        "category.utility": "أدوات متنوعة",
        "footer.copyright": "© 2025 24ToolHub. جميع الحقوق محفوظة.",
        "footer.built": "تم البناء بواسطة NNH - AI STUDIO",
        "btn.copy": "نسخ",
        "btn.clear": "مسح",
        "btn.download": "تحميل",
        "btn.back": "العودة للرئيسية",
        "btn.generate": "توليد",
        "btn.convert": "تحويل",
        "btn.process": "معالجة",
        "btn.calculate": "حساب",
        "btn.encode": "تشفير",
        "btn.decode": "فك التشفير",
        "btn.format": "تنسيق",
        "btn.validate": "التحقق",
        "btn.analyze": "تحليل",
        "btn.parse": "تحليل",
        "btn.compare": "مقارنة",
        "btn.reset": "إعادة تعيين",
        "btn.submit": "إرسال",
        "btn.save": "حفظ",
        "btn.load": "تحميل",
        "btn.export": "تصدير",
        "btn.import": "استيراد",
        "btn.refresh": "تحديث",
        "btn.search": "بحث",
        "input.placeholder": "أدخل النص هنا...",
        "output.placeholder": "ستظهر النتائج هنا...",
        "stats.words": "كلمات",
        "stats.characters": "أحرف",
        "stats.sentences": "جمل",
        "stats.paragraphs": "فقرات",
        "stats.lines": "أسطر",
        "stats.reading_time": "وقت القراءة",
        "stats.minutes": "دقيقة",
        "stats.seconds": "ثانية",
        "tool.schemaGenerator": "مولد Schema",
        "tool.wordCounter": "عداد الكلمات",
        "tool.textCaseConverter": "محول حالة النص",
        "tool.stringReverser": "عاكس النص",
        "tool.removeDuplicates": "إزالة المكرر",
        "tool.findReplace": "بحث واستبدال",
        "tool.textSplitter": "فاصل النص",
        "tool.trimWhitespace": "إزالة المسافات",
        "tool.characterCounter": "عداد الأحرف",
        "tool.lineCounter": "عداد الأسطر",
        "tool.sentenceCounter": "عداد الجمل",
        "tool.temperatureConverter": "محول الحرارة",
        "tool.lengthConverter": "محول الطول",
        "tool.weightConverter": "محول الوزن",
        "tool.volumeConverter": "محول الحجم",
        "tool.speedConverter": "محول السرعة",
        "tool.timeConverter": "محول الوقت",
        "tool.currencyConverter": "محول العملات",
        "tool.percentageCalculator": "حاسبة النسبة المئوية",
        "tool.loanCalculator": "حاسبة القروض",
        "tool.bmiCalculator": "حاسبة مؤشر كتلة الجسم",
        "tool.uuidGenerator": "مولد UUID",
        "tool.qrCodeGenerator": "مولد رمز QR",
        "tool.jsonFormatter": "منسق JSON",
        "tool.xmlFormatter": "منسق XML",
        "tool.csvToJson": "محول CSV إلى JSON",
        "tool.markdownToHtml": "محول Markdown إلى HTML",
        "tool.colorPaletteGenerator": "مولد لوحة الألوان",
        "tool.dummyTextGenerator": "مولد النص التجريبي",
        "tool.passwordGenerator": "مولد كلمات المرور",
        "tool.slugGenerator": "مولد الروابط",
        "tool.base64Encoder": "مشفر Base64",
        "tool.urlEncoder": "مشفر URL",
        "tool.htmlEntityEncoder": "مشفر HTML",
        "tool.md5Hash": "تشفير MD5",
        "tool.sha256Hash": "تشفير SHA256",
        "tool.jwtDecoder": "محلل JWT",
        "tool.hexToAscii": "محول Hex إلى ASCII",
        "tool.asciiToHex": "محول ASCII إلى Hex",
        "tool.rot13Cipher": "تشفير ROT13",
        "tool.caesarCipher": "تشفير قيصر",
        "message.copied": "تم النسخ إلى الحافظة!",
        "message.cleared": "تم مسح المحتوى",
        "message.error": "حدث خطأ",
        "message.success": "تمت العملية بنجاح",
        "message.warning": "تحذير",
        "message.loading": "جاري التحميل...",
        "message.processing": "جاري المعالجة...",
        "message.noData": "لا توجد بيانات",
        "message.invalidInput": "إدخال غير صالح",
        "message.required": "هذا الحقل مطلوب",
        "message.saved": "تم الحفظ بنجاح",
        "message.deleted": "تم الحذف بنجاح",
        "message.updated": "تم التحديث بنجاح",
        "label.input": "الإدخال",
        "label.output": "الناتج",
        "label.options": "الخيارات",
        "label.settings": "الإعدادات",
        "label.result": "النتيجة",
        "label.preview": "معاينة",
        "label.example": "مثال",
        "label.help": "مساعدة",
        "label.about": "حول",
        "label.version": "الإصدار",
        "label.language": "اللغة",
        "label.theme": "المظهر",
        "label.darkMode": "الوضع الليلي",
        "label.lightMode": "الوضع النهاري",
        "label.auto": "تلقائي",
      },
    }

    return translations[this.currentLang]?.[key] || key
  },
}

// Search Functionality
const SearchManager = {
  init() {
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterTools(e.target.value)
      })
    }
  },

  filterTools(query) {
    const toolCards = document.querySelectorAll(".tool-card")
    const lowerQuery = query.toLowerCase()

    toolCards.forEach((card) => {
      const title = card.querySelector(".tool-card-title")?.textContent.toLowerCase() || ""
      const description = card.querySelector(".tool-card-description")?.textContent.toLowerCase() || ""

      if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
        card.style.display = "block"
      } else {
        card.style.display = "none"
      }
    })
  },
}

// Category Filter
const CategoryManager = {
  init() {
    const categoryBtns = document.querySelectorAll(".category-btn")
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.filterByCategory(e.target.dataset.category)

        // Update active state
        categoryBtns.forEach((b) => b.classList.remove("active"))
        e.target.classList.add("active")
      })
    })
  },

  filterByCategory(category) {
    const sections = document.querySelectorAll(".tools-section")

    if (category === "all") {
      sections.forEach((section) => (section.style.display = "block"))
    } else {
      sections.forEach((section) => {
        if (section.dataset.category === category) {
          section.style.display = "block"
        } else {
          section.style.display = "none"
        }
      })
    }
  },
}

// Utility Functions
const Utils = {
  copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showNotification("Copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  },

  downloadFile(content, filename, type = "text/plain") {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  showNotification(message) {
    // Simple notification (you can enhance this)
    const notification = document.createElement("div")
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-primary);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  },

  debounce(func, wait = 300) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  showLoadingIndicator(message) {
    const lang = getCurrentLanguage()
    const defaultMessage = lang === "en" ? "Processing..." : "جاري المعالجة..."

    const loader = document.createElement("div")
    loader.id = "loadingIndicator"
    loader.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      ">
        <div style="
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: 0.5rem;
          text-align: center;
          color: var(--text-primary);
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid var(--accent-primary);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          "></div>
          <p>${message || defaultMessage}</p>
        </div>
      </div>
    `

    // Add spin animation if not exists
    if (!document.getElementById("spinAnimation")) {
      const style = document.createElement("style")
      style.id = "spinAnimation"
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(loader)
  },

  hideLoadingIndicator() {
    const loader = document.getElementById("loadingIndicator")
    if (loader) {
      loader.remove()
    }
  },

  async processInChunks(data, chunkSize, processFn, progressCallback) {
    const chunks = []
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize))
    }

    const results = []
    for (let i = 0; i < chunks.length; i++) {
      // Process chunk
      const result = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(processFn(chunks[i], i))
        }, 0)
      })
      results.push(result)

      // Update progress
      if (progressCallback) {
        progressCallback(((i + 1) / chunks.length) * 100)
      }
    }

    return results
  },

  warnLargeData(size, threshold = 100000) {
    if (size > threshold) {
      const lang = getCurrentLanguage()
      const message =
        lang === "en" ? "Processing large data may take a moment..." : "معالجة البيانات الكبيرة قد تستغرق بعض الوقت..."
      this.showNotification(message)
      return true
    }
    return false
  },
}

function getCurrentLanguage() {
  return LanguageManager.currentLang || localStorage.getItem("language") || "en"
}

function toggleLanguage() {
  LanguageManager.currentLang = LanguageManager.currentLang === "en" ? "ar" : "en"
  localStorage.setItem("language", LanguageManager.currentLang)
  LanguageManager.updatePageLanguage()
}

// Popup utility functions
const PopupUtils = {
  // Show success message
  success: (message, title = 'Success') => {
    if (window.popup) {
      popup.success(message, title);
    }
  },

  // Show error message
  error: (message, title = 'Error') => {
    if (window.popup) {
      popup.error(message, title);
    }
  },

  // Show warning message
  warning: (message, title = 'Warning') => {
    if (window.popup) {
      popup.warning(message, title);
    }
  },

  // Show info message
  info: (message, title = 'Info') => {
    if (window.popup) {
      popup.alert(message, title);
    }
  },

  // Show confirmation dialog
  confirm: (message, title = 'Confirm', onConfirm = null) => {
    if (window.popup) {
      popup.confirm(message, title, onConfirm);
    }
  },

  // Show loading popup
  loading: (message = 'Loading...', title = 'Please Wait') => {
    if (window.popup) {
      popup.loading(message, title);
    }
  },

  // Close popup
  close: () => {
    if (window.popup) {
      popup.close();
    }
  }
};

function normalizeInternalLinks() {
  try {
    const anchors = document.querySelectorAll('a[href]');
    const origin = window.location.origin;
    anchors.forEach((a) => {
      const rawHref = a.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;

      let url;
      try {
        url = new URL(rawHref, origin + window.location.pathname);
      } catch (_) {
        return;
      }

      if (url.origin !== origin) return;

      url.protocol = 'https:';

      const paramsToRemove = [];
      url.searchParams.forEach((_v, k) => {
        if (k.toLowerCase().startsWith('utm_') || k.toLowerCase() === 'fbclid') paramsToRemove.push(k);
      });
      paramsToRemove.forEach((k) => url.searchParams.delete(k));

      if (url.pathname === '/index.html' || url.pathname === '/index') {
        url.pathname = '/';
      }
      if (url.pathname === '/blog' || url.pathname === '/blog/index.html') {
        url.pathname = '/blog/';
      }
      if (url.pathname.endsWith('/index.html')) {
        url.pathname = url.pathname.replace(/\/index\.html$/, '/');
      }

      const canonical = url.pathname + (url.search ? '?' + url.searchParams.toString() : '') + url.hash;
      if (canonical !== rawHref) {
        a.setAttribute('href', canonical);
      }
    });
  } catch (_) {
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  LanguageManager.init()
  SearchManager.init()
  CategoryManager.init()
  normalizeInternalLinks()
  
  // Add popup demo button to main page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    addPopupDemoButton();
  }
});

// Add popup demo button to main page (only if not already present)
function addPopupDemoButton() {
  const headerActions = document.querySelector('.header-actions');
  if (headerActions && !document.getElementById('popup-demo-btn') && !document.querySelector('a[href="popup-demo.html"]')) {
    const demoBtn = document.createElement('button');
    demoBtn.id = 'popup-demo-btn';
    demoBtn.className = 'btn btn-secondary';
    demoBtn.textContent = 'Popup Demo';
    demoBtn.onclick = () => {
      window.location.href = 'popup-demo.html';
    };
    headerActions.appendChild(demoBtn);
  }
}
