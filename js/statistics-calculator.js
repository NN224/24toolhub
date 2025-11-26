// Statistics Calculator Tool
class StatisticsCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
    }

    bindEvents() {
        const calculateBtn = document.getElementById('calculateStats');
        const clearBtn = document.getElementById('clearStats');
        const dataInput = document.getElementById('dataInput');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateStatistics());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }
        if (dataInput) {
            dataInput.addEventListener('input', () => this.updateDataPreview());
        }
    }

    setupUI() {
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            .stats-results {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            
            .stat-card {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
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
        `;
        document.head.appendChild(style);
    }

    parseData(input) {
        // Support multiple formats: comma-separated, space-separated, newline-separated
        const cleaned = input.trim();
        if (!cleaned) return [];

        // Try different separators
        let numbers = cleaned.split(/[,\s\n]+/)
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map(item => parseFloat(item))
            .filter(num => !isNaN(num));

        return numbers;
    }

    calculateStatistics() {
        const dataInput = document.getElementById('dataInput');
        if (!dataInput) return;

        const input = dataInput.value.trim();
        const data = this.parseData(input);

        if (data.length === 0) {
            this.showNotification('Please enter valid numeric data', 'error');
            return;
        }

        if (data.length < 2) {
            this.showNotification('Please enter at least 2 data points', 'error');
            return;
        }

        // Sort data for calculations
        const sorted = [...data].sort((a, b) => a - b);

        // Calculate statistics
        const stats = {
            count: data.length,
            sum: this.sum(data),
            mean: this.mean(data),
            median: this.median(sorted),
            mode: this.mode(data),
            range: this.range(sorted),
            variance: this.variance(data),
            standardDeviation: this.standardDeviation(data),
            min: sorted[0],
            max: sorted[sorted.length - 1],
            q1: this.quartile(sorted, 0.25),
            q2: this.median(sorted),
            q3: this.quartile(sorted, 0.75),
            iqr: this.iqr(sorted)
        };

        this.displayResults(stats, sorted);
    }

    sum(data) {
        return data.reduce((a, b) => a + b, 0);
    }

    mean(data) {
        return this.sum(data) / data.length;
    }

    median(sorted) {
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    mode(data) {
        const frequency = {};
        let maxFreq = 0;
        let modes = [];

        data.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
            if (frequency[num] > maxFreq) {
                maxFreq = frequency[num];
                modes = [num];
            } else if (frequency[num] === maxFreq) {
                modes.push(num);
            }
        });

        // If all numbers appear once, there's no mode
        if (maxFreq === 1) {
            return null;
        }

        // Return unique modes
        return [...new Set(modes)];
    }

    range(sorted) {
        return sorted[sorted.length - 1] - sorted[0];
    }

    variance(data) {
        const mean = this.mean(data);
        const squaredDiffs = data.map(num => Math.pow(num - mean, 2));
        return this.mean(squaredDiffs);
    }

    standardDeviation(data) {
        return Math.sqrt(this.variance(data));
    }

    quartile(sorted, q) {
        const index = q * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;

        if (lower === upper) {
            return sorted[lower];
        }

        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    iqr(sorted) {
        return this.quartile(sorted, 0.75) - this.quartile(sorted, 0.25);
    }

    displayResults(stats, sorted) {
        // Update basic statistics
        this.updateStat('count', stats.count);
        this.updateStat('sum', stats.sum.toFixed(2));
        this.updateStat('mean', stats.mean.toFixed(2));
        this.updateStat('median', stats.median.toFixed(2));
        
        const modeDisplay = stats.mode ? 
            (Array.isArray(stats.mode) ? stats.mode.join(', ') : stats.mode) : 
            'No mode';
        this.updateStat('mode', modeDisplay);

        // Update advanced statistics
        this.updateStat('range', stats.range.toFixed(2));
        this.updateStat('variance', stats.variance.toFixed(2));
        this.updateStat('stdDev', stats.standardDeviation.toFixed(2));
        this.updateStat('min', stats.min.toFixed(2));
        this.updateStat('max', stats.max.toFixed(2));
        this.updateStat('q1', stats.q1.toFixed(2));
        this.updateStat('q2', stats.q2.toFixed(2));
        this.updateStat('q3', stats.q3.toFixed(2));
        this.updateStat('iqr', stats.iqr.toFixed(2));

        // Show results section
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateStat(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateDataPreview() {
        const dataInput = document.getElementById('dataInput');
        const preview = document.getElementById('dataPreview');
        
        if (!dataInput || !preview) return;

        const input = dataInput.value.trim();
        const data = this.parseData(input);

        if (data.length > 0) {
            preview.textContent = `Parsed ${data.length} numbers: ${data.slice(0, 10).join(', ')}${data.length > 10 ? '...' : ''}`;
        } else {
            preview.textContent = 'Enter numbers separated by commas, spaces, or newlines';
        }
    }

    clearAll() {
        const dataInput = document.getElementById('dataInput');
        const resultsSection = document.getElementById('resultsSection');
        
        if (dataInput) dataInput.value = '';
        if (resultsSection) resultsSection.style.display = 'none';
        
        this.updateDataPreview();
        this.showNotification('Data cleared', 'success');
    }

    showNotification(message, type = 'info') {
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsCalculator();
});

