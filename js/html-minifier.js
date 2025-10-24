class HTMLMinifier {
    constructor() {
        this.htmlInput = document.getElementById('htmlInput');
        this.htmlOutput = document.getElementById('htmlOutput');
        this.minifyBtn = document.getElementById('minifyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.removeComments = document.getElementById('removeComments');
        this.collapseWhitespace = document.getElementById('collapseWhitespace');
        this.removeAttributes = document.getElementById('removeAttributes');
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
        this.htmlInput.addEventListener('input', () => {
            if (this.htmlInput.value.trim()) {
                this.minify();
            }
        });

        // Re-minify when options change
        [this.removeComments, this.collapseWhitespace, this.removeAttributes].forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (this.htmlInput.value.trim()) {
                    this.minify();
                }
            });
        });
    }

    minify() {
        const html = this.htmlInput.value;
        if (!html.trim()) {
            alert('Please enter HTML code to minify');
            return;
        }

        const originalLength = html.length;
        let minified = html;

        // Remove HTML comments (except IE conditional comments)
        if (this.removeComments.checked) {
            minified = minified.replace(/<!--(?!\[if\s).*?-->/gs, '');
        }

        // Collapse whitespace
        if (this.collapseWhitespace.checked) {
            // Preserve content inside <pre>, <textarea>, <script>, and <style>
            const preserved = [];
            minified = minified.replace(/<(pre|textarea|script|style)[\s\S]*?<\/\1>/gi, (match) => {
                preserved.push(match);
                return `___PRESERVED_${preserved.length - 1}___`;
            });

            // Collapse whitespace
            minified = minified.replace(/\s+/g, ' ');
            minified = minified.replace(/>\s+</g, '><');
            minified = minified.replace(/\s+>/g, '>');
            minified = minified.replace(/<\s+/g, '<');

            // Restore preserved content
            preserved.forEach((content, index) => {
                minified = minified.replace(`___PRESERVED_${index}___`, content);
            });
        }

        // Remove optional attributes
        if (this.removeAttributes.checked) {
            // Remove type="text/javascript" from script tags
            minified = minified.replace(/<script\s+type=["']text\/javascript["']/gi, '<script');
            // Remove type="text/css" from style tags
            minified = minified.replace(/<style\s+type=["']text\/css["']/gi, '<style');
            minified = minified.replace(/<link\s+([^>]*?)type=["']text\/css["']/gi, '<link $1');
        }

        // Remove quotes from attributes when safe
        minified = minified.replace(/=["']([a-zA-Z0-9-_]+)["']/g, '=$1');

        // Trim
        minified = minified.trim();

        const minifiedLength = minified.length;
        const savedBytes = originalLength - minifiedLength;
        const percentage = ((savedBytes / originalLength) * 100).toFixed(2);

        this.htmlOutput.value = minified;
        
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
        const html = this.htmlOutput.value;
        if (!html) return;

        const blob = new Blob([html], { type: 'text/html' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'minified.html');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    copy() {
        this.htmlOutput.select();
        document.execCommand('copy');
        
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
        }, 2000);
    }

    clear() {
        this.htmlInput.value = '';
        this.htmlOutput.value = '';
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HTMLMinifier();
});
