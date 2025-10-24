class CSSMinifier {
    constructor() {
        this.cssInput = document.getElementById('cssInput');
        this.cssOutput = document.getElementById('cssOutput');
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
        this.cssInput.addEventListener('input', () => {
            if (this.cssInput.value.trim()) {
                this.minify();
            }
        });
    }

    minify() {
        const css = this.cssInput.value;
        if (!css.trim()) {
            alert('Please enter CSS code to minify');
            return;
        }

        const originalLength = css.length;
        let minified = css;

        // Remove comments
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove whitespace
        minified = minified.replace(/\s+/g, ' ');
        
        // Remove spaces around special characters
        minified = minified.replace(/\s*([{}:;,>+~])\s*/g, '$1');
        
        // Remove unnecessary semicolons
        minified = minified.replace(/;}/g, '}');
        
        // Remove spaces after colons in URLs
        minified = minified.replace(/:\s*/g, ':');
        
        // Remove quotes from URLs when possible
        minified = minified.replace(/url\(["']?([^"')]+)["']?\)/g, 'url($1)');
        
        // Convert rgb to hex when possible
        minified = minified.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
            return '#' + [r, g, b].map(x => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        });
        
        // Shorten hex colors
        minified = minified.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
        
        // Remove leading zeros
        minified = minified.replace(/:0\.(\d)/g, ':.$1');
        minified = minified.replace(/(\s)0\.(\d)/g, '$1.$2');
        
        // Replace 0px, 0em, 0% etc. with 0
        minified = minified.replace(/\b0(px|em|%|in|cm|mm|pc|pt|ex)/g, '0');
        
        // Trim
        minified = minified.trim();

        const minifiedLength = minified.length;
        const savedBytes = originalLength - minifiedLength;
        const percentage = ((savedBytes / originalLength) * 100).toFixed(2);

        this.cssOutput.value = minified;
        
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
        const css = this.cssOutput.value;
        if (!css) return;

        const blob = new Blob([css], { type: 'text/css' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'minified.css');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    copy() {
        this.cssOutput.select();
        document.execCommand('copy');
        
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
        }, 2000);
    }

    clear() {
        this.cssInput.value = '';
        this.cssOutput.value = '';
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CSSMinifier();
});
