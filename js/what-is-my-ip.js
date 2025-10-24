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

        this.init();
    }

    init() {
        this.loadBrowserInfo();
        this.loadIPInfo();

        this.copyIpBtn.addEventListener('click', () => this.copyIP());
        this.refreshBtn.addEventListener('click', () => this.refresh());
        this.getIpv6Btn.addEventListener('click', () => this.toggleIPVersion());
    }

    async loadIPInfo() {
        try {
            const apiUrl = this.isIPv6 
                ? 'https://api64.ipify.org?format=json'
                : 'https://api.ipify.org?format=json';
            
            const ipResponse = await fetch(apiUrl);
            const ipData = await ipResponse.json();
            this.currentIP = ipData.ip;

            this.ipAddress.textContent = this.currentIP;
            this.copyIpBtn.style.display = 'inline-block';

            await this.loadLocationInfo(this.currentIP);
        } catch (error) {
            console.error('Error loading IP:', error);
            this.ipAddress.textContent = 'Error loading IP';
            this.showStatus('Failed to load IP information. Please try again.', 'error');
        }
    }

    async loadLocationInfo(ip) {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.reason || 'API Error');
            }

            this.country.textContent = data.country_name || '--';
            this.region.textContent = data.region || '--';
            this.city.textContent = data.city || '--';
            this.postal.textContent = data.postal || '--';
            this.timezone.textContent = data.timezone || '--';
            this.isp.textContent = data.org || '--';
            this.org.textContent = data.org || '--';
            this.asn.textContent = data.asn || '--';
            this.latitude.textContent = data.latitude || '--';
            this.longitude.textContent = data.longitude || '--';

        } catch (error) {
            console.error('Error loading location:', error);
            this.country.textContent = 'N/A';
            this.region.textContent = 'N/A';
            this.city.textContent = 'N/A';
        }
    }

    loadBrowserInfo() {
        const ua = navigator.userAgent;
        this.userAgent.textContent = ua;

        const browserInfo = this.detectBrowser(ua);
        this.browser.textContent = browserInfo.name;
        this.browserVersion.textContent = browserInfo.version;

        this.platform.textContent = navigator.platform || '--';
        this.language.textContent = navigator.language || '--';
        this.screen.textContent = `${screen.width} × ${screen.height}`;
        
        this.os.textContent = this.detectOS(ua);
        this.cookies.textContent = navigator.cookieEnabled ? 'Enabled' : 'Disabled';
        this.java.textContent = navigator.javaEnabled() ? 'Enabled' : 'Disabled';
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
            this.copyIpBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                this.copyIpBtn.textContent = '📋 Copy IP Address';
            }, 2000);
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
        this.copyIpBtn.style.display = 'none';
        this.hideStatus();
        this.loadIPInfo();
        this.loadBrowserInfo();
        this.showStatus('Information refreshed successfully!', 'success');
    }

    async toggleIPVersion() {
        this.isIPv6 = !this.isIPv6;
        this.getIpv6Btn.textContent = this.isIPv6 ? 'Get IPv4 Address' : 'Get IPv6 Address';
        this.ipAddress.innerHTML = '<span class="loading">Loading...</span>';
        this.copyIpBtn.style.display = 'none';
        this.hideStatus();
        await this.loadIPInfo();
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        setTimeout(() => this.hideStatus(), 3000);
    }

    hideStatus() {
        this.statusMessage.className = 'status-message';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WhatIsMyIP();
});
