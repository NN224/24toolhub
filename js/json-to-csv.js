class JSONToCSVConverter {
    constructor() {
        this.jsonInput = document.getElementById('jsonInput');
        this.csvOutput = document.getElementById('csvOutput');
        this.convertBtn = document.getElementById('convertBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.includeHeaders = document.getElementById('includeHeaders');
        this.delimiter = document.getElementById('delimiter');
        this.stats = document.getElementById('stats');
        this.rowCount = document.getElementById('rowCount');
        this.columnCount = document.getElementById('columnCount');

        this.init();
    }

    init() {
        this.convertBtn.addEventListener('click', () => this.convert());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.clearBtn.addEventListener('click', () => this.clear());
        
        // Auto-convert on input change
        this.jsonInput.addEventListener('input', () => {
            if (this.jsonInput.value.trim()) {
                this.convert();
            }
        });

        this.includeHeaders.addEventListener('change', () => {
            if (this.csvOutput.value) {
                this.convert();
            }
        });

        this.delimiter.addEventListener('change', () => {
            if (this.csvOutput.value) {
                this.convert();
            }
        });
    }

    convert() {
        try {
            const jsonText = this.jsonInput.value.trim();
            if (!jsonText) {
                this.showError('Please enter JSON data');
                return;
            }

            const jsonData = JSON.parse(jsonText);
            
            if (!Array.isArray(jsonData)) {
                this.showError('JSON must be an array of objects');
                return;
            }

            if (jsonData.length === 0) {
                this.showError('JSON array is empty');
                return;
            }

            const csv = this.jsonToCSV(jsonData);
            this.csvOutput.value = csv;
            
            // Update stats
            const rows = csv.split('\n').length;
            const cols = csv.split('\n')[0].split(this.delimiter.value).length;
            this.rowCount.textContent = this.includeHeaders.checked ? rows - 1 : rows;
            this.columnCount.textContent = cols;
            this.stats.style.display = 'grid';
            
            // Show action buttons
            this.downloadBtn.style.display = 'inline-block';
            this.copyBtn.style.display = 'inline-block';
            
        } catch (error) {
            this.showError('Invalid JSON: ' + error.message);
        }
    }

    jsonToCSV(jsonData) {
        const delimiter = this.delimiter.value;
        const includeHeaders = this.includeHeaders.checked;
        
        // Get all unique keys from all objects
        const keys = Array.from(
            new Set(jsonData.flatMap(obj => Object.keys(obj)))
        );

        // Build CSV
        let csv = '';
        
        // Add headers
        if (includeHeaders) {
            csv = keys.map(key => this.escapeCSV(key)).join(delimiter) + '\n';
        }

        // Add rows
        jsonData.forEach(obj => {
            const row = keys.map(key => {
                const value = obj[key] !== undefined ? obj[key] : '';
                return this.escapeCSV(String(value));
            });
            csv += row.join(delimiter) + '\n';
        });

        return csv.trim();
    }

    escapeCSV(value) {
        // Escape quotes and wrap in quotes if necessary
        if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes(this.delimiter.value)) {
            return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    }

    download() {
        const csv = this.csvOutput.value;
        if (!csv) return;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    copy() {
        this.csvOutput.select();
        document.execCommand('copy');
        
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
        }, 2000);
    }

    clear() {
        this.jsonInput.value = '';
        this.csvOutput.value = '';
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }

    showError(message) {
        this.csvOutput.value = 'Error: ' + message;
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JSONToCSVConverter();
});
