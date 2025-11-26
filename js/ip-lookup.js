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
      if (!ipRegex.test(ip)) {
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

        // Try multiple APIs with fallback
        let data = null;
        let error = null;

        // Try apiip.net with API key first (if available) - Best option
        const apiipKey = process.env?.APIIP_KEY || window.APIIP_KEY || 'f129315d-5edf-47db-b502-697da18823ee';
        if (apiipKey) {
          try {
            const response = await fetch(`https://apiip.net/api/check?ip=${ip}&accessKey=${apiipKey}`);
            if (response.ok) {
              const apiipData = await response.json();
              if (apiipData && !apiipData.error) {
                // Convert apiip.net format to our format
                data = {
                  ip: apiipData.ip || ip,
                  country_name: apiipData.countryName || apiipData.country_name,
                  country_code: apiipData.countryCode || apiipData.country_code,
                  region: apiipData.regionName || apiipData.region,
                  city: apiipData.city,
                  postal: apiipData.postalCode || apiipData.postal,
                  latitude: apiipData.latitude,
                  longitude: apiipData.longitude,
                  timezone: apiipData.timeZone || apiipData.timezone,
                  org: apiipData.org || apiipData.isp || apiipData.organization,
                  asn: apiipData.asn,
                  currency: apiipData.currency,
                  currency_symbol: apiipData.currencySymbol
                };
                displayIPInfo(data);
                if (window.Utils && window.Utils.hideLoadingIndicator) {
                  window.Utils.hideLoadingIndicator();
                }
                return;
              }
            }
          } catch (e) {
            console.log('apiip.net failed, trying fallback...', e);
          }
        }

        // Try ipapi.co with API key (if available)
        const ipapiKey = process.env?.IPAPI_KEY || window.IPAPI_KEY;
        if (ipapiKey) {
          try {
            const response = await fetch(`https://ipapi.co/${ip}/json/?key=${ipapiKey}`);
            if (response.ok) {
              data = await response.json();
              if (!data.error) {
                displayIPInfo(data);
                if (window.Utils && window.Utils.hideLoadingIndicator) {
                  window.Utils.hideLoadingIndicator();
                }
                return;
              }
            }
          } catch (e) {
            console.log('ipapi.co with key failed, trying fallback...');
          }
        }

        // Fallback 1: ipapi.co free tier
        try {
          const response = await fetch(`https://ipapi.co/${ip}/json/`);
          if (response.ok) {
            data = await response.json();
            if (!data.error) {
              displayIPInfo(data);
              if (window.Utils && window.Utils.hideLoadingIndicator) {
                window.Utils.hideLoadingIndicator();
              }
              return;
            }
          }
        } catch (e) {
          console.log('ipapi.co free tier failed, trying alternative...');
        }

        // Fallback 2: ip-api.com (free tier, 45 requests/minute)
        try {
          const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
          if (response.ok) {
            const ipApiData = await response.json();
            if (ipApiData.status === 'success') {
              // Convert ip-api.com format to ipapi.co format
              data = {
                ip: ipApiData.query,
                country_name: ipApiData.country,
                country_code: ipApiData.countryCode,
                region: ipApiData.regionName,
                city: ipApiData.city,
                postal: ipApiData.zip,
                latitude: ipApiData.lat,
                longitude: ipApiData.lon,
                timezone: ipApiData.timezone,
                org: ipApiData.org || ipApiData.isp,
                asn: ipApiData.as
              };
              displayIPInfo(data);
              if (window.Utils && window.Utils.hideLoadingIndicator) {
                window.Utils.hideLoadingIndicator();
              }
              return;
            }
          }
        } catch (e) {
          console.log('ip-api.com failed, trying last fallback...');
        }

        // Fallback 3: ipwhois.app (free tier)
        try {
          const response = await fetch(`https://ipwhois.app/json/${ip}`);
          if (response.ok) {
            const whoisData = await response.json();
            if (whoisData.success) {
              data = {
                ip: whoisData.ip,
                country_name: whoisData.country,
                country_code: whoisData.country_code,
                region: whoisData.region,
                city: whoisData.city,
                postal: whoisData.postal,
                latitude: whoisData.latitude,
                longitude: whoisData.longitude,
                timezone: whoisData.timezone,
                org: whoisData.org || whoisData.isp,
                asn: whoisData.asn
              };
              displayIPInfo(data);
              if (window.Utils && window.Utils.hideLoadingIndicator) {
                window.Utils.hideLoadingIndicator();
              }
              return;
            }
          }
        } catch (e) {
          console.log('ipwhois.app failed');
        }

        // All APIs failed
        throw new Error('All IP lookup services failed. Please try again later.');

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

        // Get user's IP address
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();

        if (window.Utils && window.Utils.hideLoadingIndicator) {
          window.Utils.hideLoadingIndicator();
        }

        ipAddress.value = data.ip;
        await lookupIP();

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