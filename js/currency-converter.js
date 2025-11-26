// Currency Converter Tool Logic
;(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const fromValue = document.getElementById("fromValue");
    const fromUnit = document.getElementById("fromUnit");
    const toValue = document.getElementById("toValue");
    const toUnit = document.getElementById("toUnit");

    // Cache for exchange rates (valid for 1 hour)
    let exchangeRatesCache = null;
    let cacheTimestamp = null;
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

    // Fallback rates (updated periodically)
    const fallbackRates = {
      'USD': 1.0,
      'EUR': 0.92,
      'GBP': 0.79,
      'JPY': 150.0,
      'AUD': 1.52,
      'CAD': 1.35,
      'CHF': 0.88,
      'CNY': 7.20,
      'AED': 3.67,
      'SAR': 3.75,
      'EGP': 48.0,
      'JOD': 0.71,
      'KWD': 0.31,
      'QAR': 3.64,
      'BHD': 0.38
    };

    // Fetch real-time exchange rates
    async function fetchExchangeRates() {
      // Check cache first
      if (exchangeRatesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        return exchangeRatesCache;
      }

      try {
        // Try using backend endpoint first (supports API key)
        const backendResponse = await fetch('/exchange-rates');
        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          if (backendData.rates) {
            exchangeRatesCache = backendData.rates;
            cacheTimestamp = Date.now();
            return exchangeRatesCache;
          }
        }
      } catch (backendError) {
        console.log('Backend API failed, trying direct API...');
      }

      try {
        // Fallback to direct API call (free, no API key required)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        exchangeRatesCache = data.rates;
        cacheTimestamp = Date.now();
        return exchangeRatesCache;
      } catch (error) {
        console.warn('Failed to fetch exchange rates, using fallback:', error);
        // Return fallback rates if API fails
        return fallbackRates;
      }
    }

    async function convertCurrency() {
      const inputValue = parseFloat(fromValue.value);
      const fromCurrency = fromUnit.value;
      const toCurrency = toUnit.value;

      if (isNaN(inputValue) || inputValue <= 0) {
        toValue.value = "";
        return;
      }

      try {
        // Show loading state
        if (toValue) {
          toValue.value = "Loading...";
        }

        // Fetch real-time rates
        const rates = await fetchExchangeRates();

        // Get rates (default to 1 if currency not found)
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[toCurrency] || 1;

        // Convert: fromCurrency -> USD -> toCurrency
        const usdValue = inputValue / fromRate;
        const result = usdValue * toRate;

        // Format result based on currency
        let formattedResult;
        if (toCurrency === 'JPY' || toCurrency === 'KRW' || toCurrency === 'VND') {
          formattedResult = Math.round(result).toLocaleString();
        } else {
          formattedResult = result.toFixed(2);
        }

        toValue.value = formattedResult;
      } catch (error) {
        console.error('Conversion error:', error);
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("Error converting currency. Please try again.", "error");
        }
        toValue.value = "";
      }
    }

    // Auto-convert on input change (with debounce)
    if (fromValue) {
      const debouncedConvert = window.Utils ? 
        window.Utils.debounce(convertCurrency, 500) : 
        (() => {
          let timeout;
          return () => {
            clearTimeout(timeout);
            timeout = setTimeout(convertCurrency, 500);
          };
        })();
      fromValue.addEventListener("input", debouncedConvert);
    }

    if (fromUnit) {
      fromUnit.addEventListener("change", convertCurrency);
    }

    if (toUnit) {
      toUnit.addEventListener("change", convertCurrency);
    }

    // Global functions for buttons
    window.convertCurrency = convertCurrency;

    window.clearCurrency = () => {
      fromValue.value = "";
      toValue.value = "";
    };

    window.copyResult = () => {
      if (!toValue.value || toValue.value === "Loading...") {
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("No result to copy");
        } else {
          alert("No result to copy");
        }
        return;
      }

      const fromCurrencyName = fromUnit.options[fromUnit.selectedIndex].text;
      const toCurrencyName = toUnit.options[toUnit.selectedIndex].text;
      const result = `${fromValue.value || '0'} ${fromCurrencyName} = ${toValue.value} ${toCurrencyName}`;
      
      if (window.Utils && window.Utils.copyToClipboard) {
        window.Utils.copyToClipboard(result);
      } else {
        navigator.clipboard.writeText(result).then(() => {
          alert('Currency conversion copied to clipboard!');
        });
      }
    };

    // Pre-fetch rates on load
    fetchExchangeRates().then(() => {
      // Initial conversion after rates are loaded
      if (fromValue && fromValue.value) {
        convertCurrency();
      }
    });
  });
})();