class YAMLToJSONConverter {
    constructor() {
        this.yamlInput = document.getElementById('yamlInput');
        this.jsonOutput = document.getElementById('jsonOutput');
        this.convertBtn = document.getElementById('convertBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.prettyPrint = document.getElementById('prettyPrint');
        this.indentSize = document.getElementById('indentSize');
        this.stats = document.getElementById('stats');
        this.yamlSize = document.getElementById('yamlSize');
        this.jsonSize = document.getElementById('jsonSize');

        this.init();
    }

    init() {
        this.convertBtn.addEventListener('click', () => this.convert());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.clearBtn.addEventListener('click', () => this.clear());
        
        // Auto-convert on input change
        this.yamlInput.addEventListener('input', () => {
            if (this.yamlInput.value.trim()) {
                this.convert();
            }
        });

        this.prettyPrint.addEventListener('change', () => {
            if (this.jsonOutput.value) {
                this.convert();
            }
        });

        this.indentSize.addEventListener('change', () => {
            if (this.jsonOutput.value && this.prettyPrint.checked) {
                this.convert();
            }
        });
    }

    convert() {
        try {
            const yamlText = this.yamlInput.value.trim();
            if (!yamlText) {
                this.showError('Please enter YAML data');
                return;
            }

            // Check if js-yaml library is loaded
            if (typeof jsyaml === 'undefined') {
                this.showError('YAML parser library not loaded. Please refresh the page.');
                return;
            }

            // Parse YAML to JavaScript object
            const data = jsyaml.load(yamlText);
            
            // Convert to JSON string
            let json;
            if (this.prettyPrint.checked) {
                const indent = parseInt(this.indentSize.value);
                json = JSON.stringify(data, null, indent);
            } else {
                json = JSON.stringify(data);
            }
            
            this.jsonOutput.value = json;
            
            // Update stats
            this.yamlSize.textContent = yamlText.length.toLocaleString();
            this.jsonSize.textContent = json.length.toLocaleString();
            this.stats.style.display = 'grid';
            
            // Show action buttons
            this.downloadBtn.style.display = 'inline-block';
            this.copyBtn.style.display = 'inline-block';
            
        } catch (error) {
            this.showError('Invalid YAML: ' + error.message);
        }
    }

    download() {
        const json = this.jsonOutput.value;
        if (!json) return;

        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'converted.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    copy() {
        this.jsonOutput.select();
        document.execCommand('copy');
        
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
        }, 2000);
    }

    clear() {
        this.yamlInput.value = '';
        this.jsonOutput.value = '';
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }

    showError(message) {
        this.jsonOutput.value = 'Error: ' + message;
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new YAMLToJSONConverter();
});
