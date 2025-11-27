// IP Lookup Tool Logic
;(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const ipAddress = document.getElementById("ipAddress");
    const ipInfo = document.getElementById("ipInfo");
    const ipDetails = document.getElementById("ipDetails");

    async function lookupIP() {
      const ip = ipAddress.value.trim();
      
      if (!ip) {
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("Please enter an IP address");
        } else {
          alert("Please enter an IP address");
        }
        return;
      }

      // Basic IP validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      // Also allow IPv6
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      
      if (!ipRegex.test(ip) && !ipv6Regex.test(ip)) {
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("Please enter a valid IP address");
        } else {
          alert("Please enter a valid IP address");
        }
        return;
      }

      try {
        if (window.Utils && window.Utils.showLoadingIndicator) {
          window.Utils.showLoadingIndicator("Looking up IP address...");
        }

        // Use backend endpoint
        const response = await fetch(`/ip-info?ip=${encodeURIComponent(ip)}`);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

              displayIPInfo(data);
        
        if (window.Utils && window.Utils.hideLoadingIndicator) {
          window.Utils.hideLoadingIndicator();
      }

      } catch (error) {
        if (window.Utils && window.Utils.hideLoadingIndicator) {
          window.Utils.hideLoadingIndicator();
        }

        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("Error: " + error.message);
        } else {
          alert("Error: " + error.message);
        }
      }
    }

    async function getMyIP() {
      try {
        if (window.Utils && window.Utils.showLoadingIndicator) {
          window.Utils.showLoadingIndicator("Getting your IP address...");
        }

        // Get user's IP via backend
        const response = await fetch('/ip-info');
        const data = await response.json();

        if (window.Utils && window.Utils.hideLoadingIndicator) {
          window.Utils.hideLoadingIndicator();
        }

        if (data.ip) {
        ipAddress.value = data.ip;
            // Also display info for my IP immediately
            displayIPInfo(data);
        } else {
            throw new Error('Could not determine IP');
        }

      } catch (error) {
        if (window.Utils && window.Utils.hideLoadingIndicator) {
          window.Utils.hideLoadingIndicator();
        }

        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("Error getting your IP: " + error.message);
        } else {
          alert("Error getting your IP: " + error.message);
        }
      }
    }

    function displayIPInfo(data) {
      const infoHTML = `
        <div style="display: grid; gap: 0.5rem; font-family: monospace; font-size: 0.875rem;">
          <div><strong>IP Address:</strong> <span style="color: var(--accent-primary);">${data.ip || 'N/A'}</span></div>
          <div><strong>Country:</strong> <span style="color: var(--accent-primary);">${data.country_name || 'N/A'}</span> ${data.country_code ? `(${data.country_code})` : ''}</div>
          <div><strong>Region:</strong> <span style="color: var(--accent-primary);">${data.region || 'N/A'}</span></div>
          <div><strong>City:</strong> <span style="color: var(--accent-primary);">${data.city || 'N/A'}</span></div>
          <div><strong>Postal Code:</strong> <span style="color: var(--accent-primary);">${data.postal || 'N/A'}</span></div>
          <div><strong>ISP:</strong> <span style="color: var(--accent-primary);">${data.org || 'N/A'}</span></div>
          <div><strong>Timezone:</strong> <span style="color: var(--accent-primary);">${data.timezone || 'N/A'}</span></div>
          <div><strong>Coordinates:</strong> <span style="color: var(--accent-primary);">${data.latitude || 'N/A'}, ${data.longitude || 'N/A'}</span></div>
          <div><strong>ASN:</strong> <span style="color: var(--accent-primary);">${data.asn || 'N/A'}</span></div>
          ${data.currency ? `<div><strong>Currency:</strong> <span style="color: var(--accent-primary);">${data.currency} ${data.currency_symbol || ''}</span></div>` : ''}
        </div>
      `;

      ipDetails.innerHTML = infoHTML;
      ipInfo.style.display = "block";
    }

    function clearResults() {
      ipAddress.value = "";
      ipInfo.style.display = "none";
      ipDetails.innerHTML = "";
    }

    // Global functions for buttons
    window.lookupIP = lookupIP;
    window.getMyIP = getMyIP;
    window.clearResults = clearResults;

    // Auto-lookup on Enter key
    if (ipAddress) {
      ipAddress.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          lookupIP();
        }
      });
    }
  });
})();
