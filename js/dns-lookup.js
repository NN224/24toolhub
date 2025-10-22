// DNS Lookup Tool

// Configuration for the backend API
const DNS_API_ENDPOINT = '/dns-lookup';

class DNSLookup {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
    }

    bindEvents() {
        const lookupBtn = document.getElementById('lookupDNS');
        const clearBtn = document.getElementById('clearResults');
        const copyBtn = document.getElementById('copyResults');
        const downloadBtn = document.getElementById('downloadResults');
        const domainInput = document.getElementById('domainInput');

        lookupBtn.addEventListener('click', () => this.lookupDNS());
        clearBtn.addEventListener('click', () => this.clearResults());
        copyBtn.addEventListener('click', () => this.copyResults());
        downloadBtn.addEventListener('click', () => this.downloadResults());
        
        domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.lookupDNS();
            }
        });

        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const domain = btn.getAttribute('data-domain');
                document.getElementById('domainInput').value = domain;
            });
        });
    }

    setupUI() {
        // Add custom styles for DNS lookup
        const style = document.createElement('style');
        style.textContent = `
            .domain-input-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .record-type-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .section-heading {
                color: var(--accent-primary);
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }
            
            .record-types-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .record-type-option {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .record-type-option:hover {
                background: var(--bg-secondary);
            }
            
            .record-type-option input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--accent-primary);
            }
            
            .record-type-label {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .record-type-label strong {
                color: var(--accent-primary);
                font-size: 1.1rem;
            }
            
            .record-description {
                color: var(--text-secondary);
                font-size: 0.875rem;
            }
            
            .loading-indicator {
                text-align: center;
                padding: 2rem;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                margin: 1.5rem 0;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top: 4px solid var(--accent-primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .results-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin: 1.5rem 0;
            }
            
            .results-heading {
                color: var(--accent-primary);
                margin-bottom: 1.5rem;
            }
            
            .domain-info {
                margin-bottom: 2rem;
            }
            
            .subsection-heading {
                color: var(--accent-primary);
                margin-bottom: 1rem;
                font-size: 1rem;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .info-item {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                text-align: center;
            }
            
            .info-label {
                display: block;
                color: var(--text-secondary);
                font-size: 0.875rem;
                margin-bottom: 0.25rem;
            }
            
            .info-value {
                display: block;
                font-size: 1.1rem;
                font-weight: bold;
                color: var(--accent-primary);
            }
            
            .dns-records {
                margin-bottom: 2rem;
            }
            
            .records-list {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
            }
            
            .record-item {
                border-bottom: 1px solid var(--border-color);
                padding: 1rem 0;
            }
            
            .record-item:last-child {
                border-bottom: none;
            }
            
            .record-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .record-type {
                background: var(--accent-primary);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-weight: bold;
                font-size: 0.875rem;
            }
            
            .record-ttl {
                color: var(--text-secondary);
                font-size: 0.875rem;
            }
            
            .record-value {
                font-family: monospace;
                background: var(--bg-secondary);
                padding: 0.5rem;
                border-radius: 0.25rem;
                word-break: break-all;
                color: var(--text-primary);
            }
            
            .results-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .examples-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin: 1.5rem 0;
            }
            
            .examples-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 0.5rem;
            }
            
            .example-btn {
                padding: 0.75rem 1rem;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.875rem;
            }
            
            .example-btn:hover {
                background: var(--accent-primary);
                color: white;
                border-color: var(--accent-primary);
            }
        `;
        document.head.appendChild(style);
    }

    async lookupDNS() {
        const domain = document.getElementById('domainInput').value.trim();
        
        if (!domain) {
            this.showNotification('Please enter a domain name', 'error');
            return;
        }

        // Validate domain format
        if (!this.isValidDomain(domain)) {
            this.showNotification('Please enter a valid domain name', 'error');
            return;
        }

        const selectedRecords = this.getSelectedRecordTypes();
        if (selectedRecords.length === 0) {
            this.showNotification('Please select at least one record type', 'error');
            return;
        }

        this.showLoading(true);
        this.hideResults();

        try {
            const startTime = Date.now();
            const results = await this.performDNSLookup(domain, selectedRecords);
            const endTime = Date.now();
            
            this.displayResults(domain, results, endTime - startTime);
        } catch (error) {
            this.showNotification('DNS lookup failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
        return domainRegex.test(domain);
    }

    getSelectedRecordTypes() {
        const recordTypes = [];
        const checkboxes = [
            { id: 'recordA', type: 'A' },
            { id: 'recordAAAA', type: 'AAAA' },
            { id: 'recordCNAME', type: 'CNAME' },
            { id: 'recordMX', type: 'MX' },
            { id: 'recordTXT', type: 'TXT' },
            { id: 'recordNS', type: 'NS' },
            { id: 'recordSOA', type: 'SOA' },
            { id: 'recordPTR', type: 'PTR' }
        ];

        checkboxes.forEach(checkbox => {
            if (document.getElementById(checkbox.id).checked) {
                recordTypes.push(checkbox.type);
            }
        });

        return recordTypes;
    }

    async performDNSLookup(domain, recordTypes) {
        const url = new URL(DNS_API_ENDPOINT);
        url.searchParams.append('domain', domain);
        recordTypes.forEach(type => url.searchParams.append('recordTypes', type));

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'DNS lookup failed on the server.');
            }
            return await response.json();
        } catch (error) {
            console.error('DNS API error:', error);
            throw new Error('Could not connect to the lookup server.');
        }
    }


    displayResults(domain, results, lookupTime) {
        // Update domain information
        document.getElementById('domainName').textContent = domain;
        document.getElementById('lookupTime').textContent = `${lookupTime}ms`;
        
        // Count total records
        const totalRecords = Object.values(results).reduce((sum, records) => sum + records.length, 0);
        document.getElementById('recordsCount').textContent = totalRecords;
        
        // Display DNS records
        const recordsList = document.getElementById('dnsRecordsList');
        recordsList.innerHTML = '';
        
        Object.entries(results).forEach(([recordType, records]) => {
            records.forEach(record => {
                const recordItem = document.createElement('div');
                recordItem.className = 'record-item';
                
                recordItem.innerHTML = `
                    <div class="record-header">
                        <span class="record-type">${recordType}</span>
                        <span class="record-ttl">TTL: ${record.ttl}s</span>
                    </div>
                    <div class="record-value">${record.value}</div>
                `;
                
                recordsList.appendChild(recordItem);
            });
        });
        
        // Show results
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }

    copyResults() {
        const resultsText = this.getResultsAsText();
        
        navigator.clipboard.writeText(resultsText).then(() => {
            this.showNotification('Results copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy results', 'error');
        });
    }

    downloadResults() {
        const resultsText = this.getResultsAsText();
        const domain = document.getElementById('domainName').textContent;
        
        const blob = new Blob([resultsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dns_lookup_${domain}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Results downloaded', 'success');
    }

    getResultsAsText() {
        const domain = document.getElementById('domainName').textContent;
        const lookupTime = document.getElementById('lookupTime').textContent;
        const recordsCount = document.getElementById('recordsCount').textContent;
        
        let text = `DNS Lookup Results for ${domain}\n`;
        text += `Lookup Time: ${lookupTime}\n`;
        text += `Records Found: ${recordsCount}\n\n`;
        
        const recordsList = document.getElementById('dnsRecordsList');
        const recordItems = recordsList.querySelectorAll('.record-item');
        
        recordItems.forEach(item => {
            const recordType = item.querySelector('.record-type').textContent;
            const recordTTL = item.querySelector('.record-ttl').textContent;
            const recordValue = item.querySelector('.record-value').textContent;
            
            text += `${recordType} Record (${recordTTL}):\n`;
            text += `${recordValue}\n\n`;
        });
        
        return text;
    }

    clearResults() {
        document.getElementById('domainInput').value = '';
        document.getElementById('resultsSection').style.display = 'none';
        this.showNotification('Results cleared', 'success');
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (show) {
            loadingIndicator.style.display = 'block';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    hideResults() {
        document.getElementById('resultsSection').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Use existing notification system from main.js
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message, type);
        } else {
            alert(message);
        }
    }

}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DNSLookup();
});
