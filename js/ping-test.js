// Ping Test Tool

// Configuration for the backend API
const PING_API_ENDPOINT = '/ping';

class PingTest {
    constructor() {
        this.isRunning = false;
        this.pingResults = [];
        this.currentPing = 0;
        this.totalPings = 4;
        this.timeout = 5000;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
    }

    bindEvents() {
        const startPingBtn = document.getElementById('startPing');
        const stopPingBtn = document.getElementById('stopPing');
        const clearResultsBtn = document.getElementById('clearResults');
        const targetHostInput = document.getElementById('targetHost');
        const pingCountSelect = document.getElementById('pingCount');
        const timeoutSelect = document.getElementById('timeout');

        startPingBtn.addEventListener('click', () => this.startPingTest());
        stopPingBtn.addEventListener('click', () => this.stopPingTest());
        clearResultsBtn.addEventListener('click', () => this.clearResults());
        
        pingCountSelect.addEventListener('change', (e) => {
            this.totalPings = parseInt(e.target.value);
        });
        
        timeoutSelect.addEventListener('change', (e) => {
            this.timeout = parseInt(e.target.value);
        });

        targetHostInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startPingTest();
            }
        });

        // Quick target buttons
        document.querySelectorAll('.target-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const host = btn.getAttribute('data-host');
                document.getElementById('targetHost').value = host;
            });
        });
    }

    setupUI() {
        // Add custom styles for ping test
        const style = document.createElement('style');
        style.textContent = `
            .target-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .ping-settings {
                margin-top: 1rem;
            }
            
            .settings-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .progress-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin: 1.5rem 0;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: var(--border-color);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }
            
            .progress-fill {
                height: 100%;
                background: var(--accent-primary);
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .progress-text {
                text-align: center;
                color: var(--text-secondary);
                font-size: 0.875rem;
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
            
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .stat-card {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                text-align: center;
            }
            
            .stat-label {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin-bottom: 0.5rem;
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--accent-primary);
            }
            
            .ping-results {
                margin-top: 2rem;
            }
            
            .results-subheading {
                color: var(--accent-primary);
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }
            
            .ping-list {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .ping-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
                font-family: monospace;
                font-size: 0.875rem;
            }
            
            .ping-item:last-child {
                border-bottom: none;
            }
            
            .ping-info {
                color: var(--text-primary);
            }
            
            .ping-time {
                font-weight: bold;
            }
            
            .ping-success {
                color: #10b981;
            }
            
            .ping-timeout {
                color: #ef4444;
            }
            
            .ping-error {
                color: #f59e0b;
            }
            
            .quick-targets {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin: 1.5rem 0;
            }
            
            .section-heading {
                color: var(--accent-primary);
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }
            
            .targets-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 0.5rem;
            }
            
            .target-btn {
                padding: 0.75rem 1rem;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.875rem;
            }
            
            .target-btn:hover {
                background: var(--accent-primary);
                color: white;
                border-color: var(--accent-primary);
            }
            
            .loading {
                opacity: 0.6;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    async startPingTest() {
        const targetHost = document.getElementById('targetHost').value.trim();
        
        if (!targetHost) {
            this.showNotification('Please enter a target host', 'error');
            return;
        }

        this.isRunning = true;
        this.pingResults = [];
        this.currentPing = 0;
        
        this.updateControls(true);
        this.showProgress(true);
        this.hideResults();

        try {
            for (let i = 0; i < this.totalPings && this.isRunning; i++) {
                this.currentPing = i + 1;
                this.updateProgress();
                
                const result = await this.performPing(targetHost);
                this.pingResults.push(result);
                this.displayPingResult(result);
                
                // Small delay between pings
                if (i < this.totalPings - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            if (this.isRunning) {
                this.displaySummary();
            }
            
        } catch (error) {
            this.showNotification('Ping test failed: ' + error.message, 'error');
        } finally {
            this.isRunning = false;
            this.updateControls(false);
            this.showProgress(false);
        }
    }

    async performPing(host) {
        const url = new URL(PING_API_ENDPOINT);
        url.searchParams.append('host', host);
        url.searchParams.append('timeout', this.timeout);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ping request failed on the server.');
            }
            const result = await response.json();
            return {
                ...result,
                sequence: this.currentPing,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ping API error:', error);
            return {
                sequence: this.currentPing,
                host: host,
                time: this.timeout,
                status: 'error',
                error: 'Could not connect to the ping server.',
                timestamp: new Date().toISOString()
            };
        }
    }

    displayPingResult(result) {
        const pingList = document.getElementById('pingResultsList');
        const pingItem = document.createElement('div');
        pingItem.className = 'ping-item';
        
        let statusText = '';
        let timeClass = '';
        
        switch (result.status) {
            case 'success':
                statusText = `Reply from ${result.host}: time=${result.time}ms`;
                timeClass = 'ping-success';
                break;
            case 'timeout':
                statusText = `Request timed out for ${result.host}`;
                timeClass = 'ping-timeout';
                break;
            case 'error':
                statusText = `Error pinging ${result.host}: ${result.error}`;
                timeClass = 'ping-error';
                break;
        }
        
        pingItem.innerHTML = `
            <span class="ping-info">${statusText}</span>
            <span class="ping-time ${timeClass}">${result.time}ms</span>
        `;
        
        pingList.appendChild(pingItem);
        pingList.scrollTop = pingList.scrollHeight;
    }

    displaySummary() {
        const resultsSection = document.getElementById('resultsSection');
        const successfulPings = this.pingResults.filter(p => p.status === 'success');
        const failedPings = this.pingResults.filter(p => p.status !== 'success');
        
        // Update summary statistics
        document.getElementById('packetsSent').textContent = this.pingResults.length;
        document.getElementById('packetsReceived').textContent = successfulPings.length;
        
        const packetLoss = this.pingResults.length > 0 ? 
            Math.round((failedPings.length / this.pingResults.length) * 100) : 0;
        document.getElementById('packetLoss').textContent = `${packetLoss}%`;
        
        if (successfulPings.length > 0) {
            const times = successfulPings.map(p => p.time);
            const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            
            document.getElementById('averageTime').textContent = `${avgTime}ms`;
            document.getElementById('minTime').textContent = `${minTime}ms`;
            document.getElementById('maxTime').textContent = `${maxTime}ms`;
        } else {
            document.getElementById('averageTime').textContent = 'N/A';
            document.getElementById('minTime').textContent = 'N/A';
            document.getElementById('maxTime').textContent = 'N/A';
        }
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    stopPingTest() {
        this.isRunning = false;
        this.updateControls(false);
        this.showProgress(false);
        this.showNotification('Ping test stopped', 'info');
    }

    clearResults() {
        this.hideResults();
        document.getElementById('pingResultsList').innerHTML = '';
        this.pingResults = [];
        this.showNotification('Results cleared', 'success');
    }

    updateControls(isRunning) {
        const startBtn = document.getElementById('startPing');
        const stopBtn = document.getElementById('stopPing');
        
        if (isRunning) {
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            startBtn.classList.add('loading');
        } else {
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            startBtn.classList.remove('loading');
        }
    }

    showProgress(show) {
        const progressSection = document.getElementById('progressSection');
        if (show) {
            progressSection.style.display = 'block';
        } else {
            progressSection.style.display = 'none';
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        const progress = (this.currentPing / this.totalPings) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Pinging... ${this.currentPing}/${this.totalPings}`;
    }

    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
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
    new PingTest();
});
