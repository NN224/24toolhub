class WhatIsMyIP {
    constructor() {
        this.ipAddress = document.getElementById('ipAddress');
        this.copyIpBtn = document.getElementById('copyIpBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.getIpv6Btn = document.getElementById('getIpv6Btn');
        this.statusMessage = document.getElementById('statusMessage');

        this.country = document.getElementById('country');
        this.region = document.getElementById('region');
        this.city = document.getElementById('city');
        this.postal = document.getElementById('postal');
        this.timezone = document.getElementById('timezone');
        this.isp = document.getElementById('isp');
        this.org = document.getElementById('org');
        this.asn = document.getElementById('asn');
        this.latitude = document.getElementById('latitude');
        this.longitude = document.getElementById('longitude');

        this.browser = document.getElementById('browser');
        this.browserVersion = document.getElementById('browserVersion');
        this.platform = document.getElementById('platform');
        this.language = document.getElementById('language');
        this.screen = document.getElementById('screen');
        this.os = document.getElementById('os');
        this.cookies = document.getElementById('cookies');
        this.java = document.getElementById('java');
        this.userAgent = document.getElementById('userAgent');

        this.currentIP = '';
        this.isIPv6 = false;

        // Check if all elements exist
        if (!this.ipAddress) {
            console.error('What is My IP: Missing required elements');
            return;
        }

        this.init();
    }

    init() {
        this.loadBrowserInfo();
        this.loadIPInfo();

        if (this.copyIpBtn) this.copyIpBtn.addEventListener('click', () => this.copyIP());
        if (this.refreshBtn) this.refreshBtn.addEventListener('click', () => this.refresh());
        if (this.getIpv6Btn) this.getIpv6Btn.addEventListener('click', () => this.toggleIPVersion());
    }

    async loadIPInfo() {
        try {
            // Use our backend endpoint which handles multiple providers and fallbacks
            const response = await fetch('/ip-info');
            
            if (!response.ok) {
                throw new Error('Failed to fetch IP info');
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            this.currentIP = data.ip;
            this.ipAddress.textContent = this.currentIP;
            if (this.copyIpBtn) this.copyIpBtn.style.display = 'inline-block';

            this.displayLocationInfo(data);
        } catch (error) {
            console.error('Error loading IP:', error);
            this.ipAddress.textContent = 'Error loading IP';
            this.showStatus('Failed to load IP information. Please try again.', 'error');
            
            // Fallback to direct ipify call if backend fails completely
            try {
                const fallbackRes = await fetch('https://api.ipify.org?format=json');
                const fallbackData = await fallbackRes.json();
                this.currentIP = fallbackData.ip;
                this.ipAddress.textContent = this.currentIP;
            } catch (e) {
                console.error('All fallbacks failed');
            }
        }
    }

    displayLocationInfo(data) {
        if (this.country) this.country.textContent = data.country_name || '--';
        if (this.region) this.region.textContent = data.region || '--';
        if (this.city) this.city.textContent = data.city || '--';
        if (this.postal) this.postal.textContent = data.postal || '--';
        if (this.timezone) this.timezone.textContent = data.timezone || '--';
        if (this.isp) this.isp.textContent = data.org || '--';
        if (this.org) this.org.textContent = data.org || '--';
        if (this.asn) this.asn.textContent = data.asn || '--';
        if (this.latitude) this.latitude.textContent = data.latitude || '--';
        if (this.longitude) this.longitude.textContent = data.longitude || '--';
    }

    loadBrowserInfo() {
        const ua = navigator.userAgent;
        if (this.userAgent) this.userAgent.textContent = ua;

        const browserInfo = this.detectBrowser(ua);
        if (this.browser) this.browser.textContent = browserInfo.name;
        if (this.browserVersion) this.browserVersion.textContent = browserInfo.version;

        if (this.platform) this.platform.textContent = navigator.platform || '--';
        if (this.language) this.language.textContent = navigator.language || '--';
        if (this.screen) this.screen.textContent = `${screen.width} × ${screen.height}`;
        
        if (this.os) this.os.textContent = this.detectOS(ua);
        if (this.cookies) this.cookies.textContent = navigator.cookieEnabled ? 'Enabled' : 'Disabled';
        if (this.java) this.java.textContent = navigator.javaEnabled() ? 'Enabled' : 'Disabled';
    }

    detectBrowser(ua) {
        let name = 'Unknown';
        let version = '--';

        if (ua.indexOf('Firefox') > -1) {
            name = 'Firefox';
            version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '--';
        } else if (ua.indexOf('Edg') > -1) {
            name = 'Edge';
            version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '--';
        } else if (ua.indexOf('Chrome') > -1) {
            name = 'Chrome';
            version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '--';
        } else if (ua.indexOf('Safari') > -1) {
            name = 'Safari';
            version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '--';
        } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
            name = 'Opera';
            version = ua.match(/(?:Opera|OPR)\/(\d+\.\d+)/)?.[1] || '--';
        }

        return { name, version };
    }

    detectOS(ua) {
        if (ua.indexOf('Win') > -1) return 'Windows';
        if (ua.indexOf('Mac') > -1) return 'macOS';
        if (ua.indexOf('Linux') > -1) return 'Linux';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
        return 'Unknown';
    }

    async copyIP() {
        try {
            await navigator.clipboard.writeText(this.currentIP);
            this.showStatus('IP address copied to clipboard!', 'success');
            if (this.copyIpBtn) {
                const originalText = this.copyIpBtn.textContent;
                this.copyIpBtn.textContent = '✓ Copied!';
                setTimeout(() => {
                    this.copyIpBtn.textContent = originalText;
                }, 2000);
            }
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = this.currentIP;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showStatus('IP address copied to clipboard!', 'success');
        }
    }

    refresh() {
        this.ipAddress.innerHTML = '<span class="loading">Loading...</span>';
        if (this.copyIpBtn) this.copyIpBtn.style.display = 'none';
        this.hideStatus();
        this.loadIPInfo();
        this.loadBrowserInfo();
        this.showStatus('Information refreshed successfully!', 'success');
    }

    async toggleIPVersion() {
        // Currently, the backend detects IP based on connection.
        // To force IPv6, we would need to connect via IPv6, which depends on client network.
        // For now, we just refresh as browsers prefer IPv6 if available.
        this.refresh();
        this.showStatus('Refreshed. Browser automatically selects IPv4/IPv6.', 'info');
    }

    showStatus(message, type) {
        if (!this.statusMessage) return;
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        setTimeout(() => this.hideStatus(), 3000);
    }

    hideStatus() {
        if (!this.statusMessage) return;
        this.statusMessage.className = 'status-message';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WhatIsMyIP();
});
