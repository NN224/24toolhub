class JSONToXMLConverter {
    constructor() {
        this.jsonInput = document.getElementById('jsonInput');
        this.xmlOutput = document.getElementById('xmlOutput');
        this.convertBtn = document.getElementById('convertBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.rootElement = document.getElementById('rootElement');
        this.prettyPrint = document.getElementById('prettyPrint');
        this.includeDeclaration = document.getElementById('includeDeclaration');
        this.stats = document.getElementById('stats');
        this.elementCount = document.getElementById('elementCount');
        this.depthLevel = document.getElementById('depthLevel');
        this.byteSize = document.getElementById('byteSize');

        this.init();
    }

    init() {
        this.convertBtn.addEventListener('click', () => this.convert());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.clearBtn.addEventListener('click', () => this.clear());
        
        this.jsonInput.addEventListener('input', () => {
            if (this.jsonInput.value.trim()) {
                this.convert();
            }
        });

        this.prettyPrint.addEventListener('change', () => {
            if (this.xmlOutput.value) {
                this.convert();
            }
        });

        this.includeDeclaration.addEventListener('change', () => {
            if (this.xmlOutput.value) {
                this.convert();
            }
        });

        this.rootElement.addEventListener('input', () => {
            if (this.xmlOutput.value) {
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
            const rootName = this.rootElement.value.trim() || 'root';
            
            let xml = '';
            if (this.includeDeclaration.checked) {
                xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            }

            const indent = this.prettyPrint.checked ? 0 : -1;
            xml += this.jsonToXML(jsonData, rootName, indent);

            this.xmlOutput.value = xml;
            
            this.updateStats(xml);
            
            this.downloadBtn.style.display = 'inline-block';
            this.copyBtn.style.display = 'inline-block';
            
        } catch (error) {
            this.showError('Invalid JSON: ' + error.message);
        }
    }

    jsonToXML(obj, tagName, indent) {
        const indentStr = indent >= 0 ? '  '.repeat(indent) : '';
        const newLine = indent >= 0 ? '\n' : '';
        
        if (obj === null || obj === undefined) {
            return `${indentStr}<${tagName}/>${newLine}`;
        }
        
        if (typeof obj !== 'object') {
            const escaped = this.escapeXML(String(obj));
            return `${indentStr}<${tagName}>${escaped}</${tagName}>${newLine}`;
        }
        
        if (Array.isArray(obj)) {
            let xml = '';
            obj.forEach(item => {
                xml += this.jsonToXML(item, 'item', indent >= 0 ? indent : -1);
            });
            return xml;
        }
        
        let xml = `${indentStr}<${tagName}>${newLine}`;
        
        for (const [key, value] of Object.entries(obj)) {
            const safeKey = this.sanitizeTagName(key);
            
            if (Array.isArray(value)) {
                value.forEach(item => {
                    xml += this.jsonToXML(item, safeKey, indent >= 0 ? indent + 1 : -1);
                });
            } else {
                xml += this.jsonToXML(value, safeKey, indent >= 0 ? indent + 1 : -1);
            }
        }
        
        xml += `${indentStr}</${tagName}>${newLine}`;
        return xml;
    }

    sanitizeTagName(name) {
        return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^[^a-zA-Z_]/, '_');
    }

    escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    updateStats(xml) {
        const elements = (xml.match(/<[^\/][^>]*>/g) || []).length;
        const depth = this.calculateDepth(xml);
        const bytes = new Blob([xml]).size;

        this.elementCount.textContent = elements;
        this.depthLevel.textContent = depth;
        this.byteSize.textContent = bytes;
        this.stats.style.display = 'grid';
    }

    calculateDepth(xml) {
        let maxDepth = 0;
        let currentDepth = 0;
        
        for (let i = 0; i < xml.length; i++) {
            if (xml[i] === '<') {
                if (xml[i + 1] !== '/' && xml[i + 1] !== '?') {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                } else if (xml[i + 1] === '/') {
                    currentDepth--;
                }
            }
        }
        
        return maxDepth;
    }

    download() {
        const xml = this.xmlOutput.value;
        if (!xml) return;

        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'data.xml');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    copy() {
        this.xmlOutput.select();
        document.execCommand('copy');
        
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
        }, 2000);
    }

    clear() {
        this.jsonInput.value = '';
        this.xmlOutput.value = '';
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }

    showError(message) {
        this.xmlOutput.value = 'Error: ' + message;
        this.stats.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JSONToXMLConverter();
});
