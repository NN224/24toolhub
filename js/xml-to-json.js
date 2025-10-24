class XMLToJSONConverter {
    constructor() {
        this.xmlInput = document.getElementById('xmlInput');
        this.jsonOutput = document.getElementById('jsonOutput');
        this.convertBtn = document.getElementById('convertBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.prettyPrint = document.getElementById('prettyPrint');
        this.includeAttributes = document.getElementById('includeAttributes');
        this.compactArrays = document.getElementById('compactArrays');
        this.stats = document.getElementById('stats');
        this.objectCount = document.getElementById('objectCount');
        this.arrayCount = document.getElementById('arrayCount');
        this.byteSize = document.getElementById('byteSize');

        this.init();
    }

    init() {
        this.convertBtn.addEventListener('click', () => this.convert());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.clearBtn.addEventListener('click', () => this.clear());
        
        this.xmlInput.addEventListener('input', () => {
            if (this.xmlInput.value.trim()) {
                this.convert();
            }
        });

        this.prettyPrint.addEventListener('change', () => {
            if (this.jsonOutput.value) {
                this.convert();
            }
        });

        this.includeAttributes.addEventListener('change', () => {
            if (this.jsonOutput.value) {
                this.convert();
            }
        });

        this.compactArrays.addEventListener('change', () => {
            if (this.jsonOutput.value) {
                this.convert();
            }
        });
    }

    convert() {
        try {
            const xmlText = this.xmlInput.value.trim();
            if (!xmlText) {
                this.showError('Please enter XML data');
                return;
            }

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                this.showError('Invalid XML: ' + parseError.textContent);
                return;
            }

            const jsonObj = this.xmlToJSON(xmlDoc.documentElement);
            const jsonText = this.prettyPrint.checked 
                ? JSON.stringify(jsonObj, null, 2)
                : JSON.stringify(jsonObj);

            this.jsonOutput.value = jsonText;
            
            this.updateStats(jsonObj, jsonText);
            
            this.downloadBtn.style.display = 'inline-block';
            this.copyBtn.style.display = 'inline-block';
            
        } catch (error) {
            this.showError('Conversion error: ' + error.message);
        }
    }

    xmlToJSON(node) {
        const obj = {};
        
        if (node.attributes && node.attributes.length > 0 && this.includeAttributes.checked) {
            obj['@attributes'] = {};
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                obj['@attributes'][attr.name] = attr.value;
            }
        }
        
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
            const textValue = node.childNodes[0].nodeValue.trim();
            if (textValue) {
                if (obj['@attributes']) {
                    obj['#text'] = textValue;
                } else {
                    return textValue;
                }
            }
        }
        
        const children = {};
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            if (child.nodeType === 1) {
                const childName = child.nodeName;
                const childValue = this.xmlToJSON(child);
                
                if (children[childName]) {
                    if (Array.isArray(children[childName])) {
                        children[childName].push(childValue);
                    } else {
                        children[childName] = [children[childName], childValue];
                    }
                } else {
                    children[childName] = childValue;
                }
            }
        }
        
        for (const key in children) {
            if (this.compactArrays.checked && Array.isArray(children[key]) && children[key].length === 1) {
                obj[key] = children[key][0];
            } else {
                obj[key] = children[key];
            }
        }
        
        if (Object.keys(obj).length === 0 && Object.keys(children).length === 0) {
            return null;
        }
        
        return obj;
    }

    updateStats(jsonObj, jsonText) {
        const objectCount = this.countObjects(jsonObj);
        const arrayCount = this.countArrays(jsonObj);
        const bytes = new Blob([jsonText]).size;

        this.objectCount.textContent = objectCount;
        this.arrayCount.textContent = arrayCount;
        this.byteSize.textContent = bytes;
        this.stats.style.display = 'grid';
    }

    countObjects(obj, count = 0) {
        if (typeof obj === 'object' && obj !== null) {
            count++;
            for (const key in obj) {
                count = this.countObjects(obj[key], count);
            }
        }
        return count;
    }

    countArrays(obj, count = 0) {
        if (Array.isArray(obj)) {
            count++;
            obj.forEach(item => {
                count = this.countArrays(item, count);
            });
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                count = this.countArrays(obj[key], count);
            }
        }
        return count;
    }

    download() {
        const json = this.jsonOutput.value;
        if (!json) return;

        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'data.json');
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
        this.xmlInput.value = '';
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

document.addEventListener('DOMContentLoaded', () => {
    new XMLToJSONConverter();
});
