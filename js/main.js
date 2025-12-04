// 24ToolHub - Main JavaScript File

// Language Management
// Uses separate translation files: translations-en.js and translations-ar.js
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
      if (translation && translation !== key) {
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
      if (translation && translation !== key) {
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
    // Use separate translation files if available
    if (this.currentLang === "ar" && typeof TranslationsAR !== 'undefined') {
      return TranslationsAR[key] || key;
    }
    if (this.currentLang === "en" && typeof TranslationsEN !== 'undefined') {
      return TranslationsEN[key] || key;
    }
    
    // Fallback to inline translations for backward compatibility
    const fallbackTranslations = {
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
        "input.placeholder": "أدخل النص هنا...",
        "output.placeholder": "ستظهر النتائج هنا...",
      },
    }

    return fallbackTranslations[this.currentLang]?.[key] || key
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
    let visibleCount = 0

    toolCards.forEach((card) => {
      const title = card.querySelector(".tool-card-title")?.textContent.toLowerCase() || ""
      const description = card.querySelector(".tool-card-description")?.textContent.toLowerCase() || ""

      if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
        card.style.display = "block"
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    // Show empty state if no results
    this.showEmptyState(visibleCount === 0 && query.length > 0, query)
  },

  showEmptyState(show, query) {
    let emptyState = document.getElementById('search-empty-state')
    
    if (show && !emptyState) {
      emptyState = document.createElement('div')
      emptyState.id = 'search-empty-state'
      emptyState.style.cssText = `
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);
      `
      emptyState.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
        <h3 data-en="No tools found" data-ar="لم يتم العثور على أدوات">No tools found</h3>
        <p data-en="Try searching with different keywords" data-ar="جرب البحث بكلمات مختلفة">Try searching with different keywords</p>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
          <span data-en="Searching for: " data-ar="البحث عن: ">Searching for: </span>
          <strong>"${query}"</strong>
        </p>
      `
      
      const hero = document.querySelector('.hero')
      if (hero) {
        hero.parentNode.insertBefore(emptyState, hero.nextSibling)
      }
    } else if (!show && emptyState) {
      emptyState.remove()
    }
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
  
  // Add analytics tracking to tool cards
  const toolCards = document.querySelectorAll('.tool-card');
  toolCards.forEach(card => {
    card.addEventListener('click', function() {
      const toolName = this.querySelector('.tool-card-title')?.textContent;
      const toolUrl = this.getAttribute('href');
      
      if (window.trackToolUsage && toolName) {
        window.trackToolUsage(toolName, 'click');
      }
    });
  });
  
  // Add analytics tracking to category buttons
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.dataset.category;
      
      if (window.trackButtonClick) {
        window.trackButtonClick(`category_${category}`, 'main_page');
      }
    });
  });
  
  // Auto-load libraries for tool pages
  const isToolPage = window.location.pathname !== '/' && 
                     !window.location.pathname.endsWith('index.html') &&
                     window.location.pathname.includes('/tools/');
  
  if (isToolPage) {
    const pathPrefix = '../js/';
    const libraries = [
      'security.js',
      'lazyload-init.js',
      'notifications.js',
      'dialogs.js',
      'animations.js',
      'charts.js',
      'tool-usage-stats.js',
      'loading-states.js',
      'expand-related-tools.js',
      'date-fns-utils.js',
      'user-journey.js'
    ];
    
    libraries.forEach(lib => {
      if (!document.querySelector(`script[src*="${lib}"]`)) {
        const script = document.createElement('script');
        script.src = pathPrefix + lib;
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }
  
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
