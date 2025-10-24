class SQLFormatter {
    constructor() {
        this.sqlInput = document.getElementById('sqlInput');
        this.formatBtn = document.getElementById('formatBtn');
        this.minifyBtn = document.getElementById('minifyBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.indentSize = document.getElementById('indentSize');
        this.keywordCase = document.getElementById('keywordCase');
        this.newlineBeforeKeywords = document.getElementById('newlineBeforeKeywords');
        this.outputSection = document.getElementById('outputSection');
        this.formattedOutput = document.getElementById('formattedOutput');

        this.keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
                        'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
                        'OUTER JOIN', 'ON', 'AS', 'LIMIT', 'OFFSET', 'INSERT', 'INTO',
                        'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER',
                        'DROP', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
                        'BETWEEN', 'IN', 'LIKE', 'IS', 'NULL', 'NOT', 'EXISTS', 'CASE',
                        'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'INTERSECT', 'EXCEPT'];

        this.init();
    }

    init() {
        this.formatBtn.addEventListener('click', () => this.format());
        this.minifyBtn.addEventListener('click', () => this.minify());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.clearBtn.addEventListener('click', () => this.clear());
    }

    format() {
        const sql = this.sqlInput.value.trim();
        if (!sql) {
            alert('Please enter SQL to format');
            return;
        }

        const indent = this.indentSize.value === '\\t' ? '\t' : ' '.repeat(parseInt(this.indentSize.value));
        const newlineBefore = this.newlineBeforeKeywords.checked;
        
        let formatted = sql;
        
        // Remove extra whitespace
        formatted = formatted.replace(/\s+/g, ' ');
        
        // Add newlines before major keywords
        if (newlineBefore) {
            const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 
                                  'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
                                  'INSERT', 'UPDATE', 'DELETE', 'UNION'];
            
            majorKeywords.forEach(keyword => {
                const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                formatted = formatted.replace(regex, '\n' + keyword);
            });
        }
        
        // Add newlines after commas in SELECT
        formatted = formatted.replace(/,\s*(?![^()]*\))/g, ',\n' + indent);
        
        // Apply keyword case
        this.keywords.forEach(keyword => {
            const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
            formatted = formatted.replace(regex, this.applyCase(keyword));
        });
        
        // Clean up and indent
        const lines = formatted.split('\n').map(line => line.trim()).filter(line => line);
        let level = 0;
        const indented = lines.map(line => {
            if (line.match(/\b(FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN)\b/i)) {
                return indent + line;
            }
            if (line.startsWith(',')) {
                return indent + line;
            }
            return line;
        });
        
        formatted = indented.join('\n');
        
        // Apply syntax highlighting
        this.displayFormatted(formatted);
    }

    minify() {
        const sql = this.sqlInput.value.trim();
        if (!sql) {
            alert('Please enter SQL to minify');
            return;
        }

        const minified = sql
            .replace(/\s+/g, ' ')
            .replace(/\s*([(),;])\s*/g, '$1')
            .trim();
        
        this.displayFormatted(minified);
    }

    applyCase(keyword) {
        switch (this.keywordCase.value) {
            case 'upper':
                return keyword.toUpperCase();
            case 'lower':
                return keyword.toLowerCase();
            case 'capitalize':
                return keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
            default:
                return keyword;
        }
    }

    displayFormatted(sql) {
        // Apply syntax highlighting
        let highlighted = this.escapeHtml(sql);
        
        // Highlight keywords
        this.keywords.forEach(keyword => {
            const regex = new RegExp('\\b(' + keyword + ')\\b', 'gi');
            highlighted = highlighted.replace(regex, '<span class="sql-keyword">$1</span>');
        });
        
        // Highlight strings
        highlighted = highlighted.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');
        highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="sql-string">"$1"</span>');
        
        // Highlight numbers
        highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>');
        
        // Highlight comments
        highlighted = highlighted.replace(/--([^\n]*)/g, '<span class="sql-comment">--$1</span>');
        highlighted = highlighted.replace(/\/\*([^*]|\*[^/])*\*\//g, '<span class="sql-comment">$&</span>');
        
        this.formattedOutput.innerHTML = highlighted;
        this.outputSection.classList.add('active');
    }

    copy() {
        const text = this.formattedOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        });
    }

    clear() {
        this.sqlInput.value = '';
        this.outputSection.classList.remove('active');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SQLFormatter();
});
