class JavaScriptMinifier {
    constructor() {
        this.jsInput = document.getElementById('jsInput');
        this.jsOutput = document.getElementById('jsOutput');
        this.minifyBtn = document.getElementById('minifyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.stats = document.getElementById('stats');
        this.originalSize = document.getElementById('originalSize');
        this.minifiedSize = document.getElementById('minifiedSize');
        this.savings = document.getElementById('savings');

        this.init();
    }

    init() {
        this.minifyBtn.addEventListener('click', () => this.minify());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.clearBtn.addEventListener('click', () => this.clear());
        
        // Auto-minify on input
        this.jsInput.addEventListener('input', () => {
            if (this.jsInput.value.trim()) {
                this.minify();
            }
        });
    }

    minify() {
        const js = this.jsInput.value;
        if (!js.trim()) {
            alert('Please enter JavaScript code to minify');
            return;
        }

        const originalLength = js.length;
        let minified = js;

        // Remove single-line comments (but preserve URLs)
        minified = minified.replace(/([^:])\/\/.*$/gm, '$1');
        
        // Remove multi-line comments
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove whitespace
        minified = minified.replace(/\s+/g, ' ');
        
        // Remove spaces around operators and special characters
        minified = minified.replace(/\s*([{}()\[\];,:<>=+\-*/%&|^!~?])\s*/g, '$1');
        
        // Add space after keywords to maintain syntax
        const keywords = ['var', 'let', 'const', 'function', 'return', 'if', 'else', 
                         'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
                         'new', 'typeof', 'instanceof', 'delete', 'throw', 'try', 
                         'catch', 'finally', 'class', 'extends', 'import', 'export', 
                         'from', 'as', 'async', 'await'];
        
        keywords.forEach(keyword => {
            const regex = new RegExp('\\b' + keyword + '(?=[a-zA-Z_$])', 'g');
            minified = minified.replace(regex, keyword + ' ');
        });
        
        // Remove semicolons before closing braces (safe in most cases)
        minified = minified.replace(/;}/g, '}');
        
        // Preserve spaces around 'in' and 'of' keywords
        minified = minified.replace(/\bin\(/g, ' in (');
        minified = minified.replace(/\bof\(/g, ' of (');
        
        // Trim
        minified = minified.trim();

        const minifiedLength = minified.length;
        const savedBytes = originalLength - minifiedLength;
        const percentage = ((savedBytes / originalLength) * 100).toFixed(2);

        this.jsOutput.value = minified;
        
        // Update stats
        this.originalSize.textContent = originalLength.toLocaleString();
        this.minifiedSize.textContent = minifiedLength.toLocaleString();
        this.savings.textContent = percentage + '%';
        this.stats.style.display = 'grid';
        
        // Show buttons
        this.downloadBtn.style.display = 'inline-block';
        this.copyBtn.style.display = 'inline-block';
    }

    download() {
        const js = this.jsOutput.value;
        if (!js) return;

        const blob = new Blob([js], { type: 'application/javascript' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'minified.js');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    copy() {
        this.jsOutput.select();
        document.execCommand('copy');
        
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
        }, 2000);
    }

    clear() {
        this.jsInput.value = '';
        this.jsOutput.value = '';
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JavaScriptMinifier();
});
