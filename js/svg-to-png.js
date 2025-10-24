class SVGToPNGConverter {
    constructor() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.settingsSection = document.getElementById('settingsSection');
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.scaleInput = document.getElementById('scaleInput');
        this.maintainRatio = document.getElementById('maintainRatio');
        this.convertBtn = document.getElementById('convertBtn');
        this.statsSection = document.getElementById('statsSection');
        this.svgDimensions = document.getElementById('svgDimensions');
        this.pngDimensions = document.getElementById('pngDimensions');
        this.fileSize = document.getElementById('fileSize');
        this.previewSection = document.getElementById('previewSection');
        this.svgPreview = document.getElementById('svgPreview');
        this.pngPreview = document.getElementById('pngPreview');
        this.actionButtons = document.getElementById('actionButtons');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');

        this.svgData = null;
        this.svgWidth = 0;
        this.svgHeight = 0;
        this.pngBlob = null;
        this.originalRatio = 1;

        this.init();
    }

    init() {
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('drag-over');
        });

        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('drag-over');
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadSVG(files[0]);
            }
        });

        this.widthInput.addEventListener('input', () => {
            if (this.maintainRatio.checked && this.originalRatio) {
                this.heightInput.value = Math.round(this.widthInput.value / this.originalRatio);
            }
        });

        this.heightInput.addEventListener('input', () => {
            if (this.maintainRatio.checked && this.originalRatio) {
                this.widthInput.value = Math.round(this.heightInput.value * this.originalRatio);
            }
        });

        this.convertBtn.addEventListener('click', () => this.convertToPNG());
        this.downloadBtn.addEventListener('click', () => this.downloadPNG());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadSVG(file);
        }
    }

    loadSVG(file) {
        if (!file.type.match('image/svg.*') && !file.name.endsWith('.svg')) {
            alert('Please select an SVG file');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            this.svgData = e.target.result;
            
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(this.svgData, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');

            if (!svgElement) {
                alert('Invalid SVG file');
                return;
            }

            this.svgWidth = parseFloat(svgElement.getAttribute('width')) || parseFloat(svgElement.viewBox?.baseVal.width) || 800;
            this.svgHeight = parseFloat(svgElement.getAttribute('height')) || parseFloat(svgElement.viewBox?.baseVal.height) || 600;
            this.originalRatio = this.svgWidth / this.svgHeight;

            this.widthInput.value = Math.round(this.svgWidth);
            this.heightInput.value = Math.round(this.svgHeight);

            this.svgPreview.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(this.svgData)));
            this.svgDimensions.textContent = `${Math.round(this.svgWidth)}x${Math.round(this.svgHeight)}`;

            this.settingsSection.classList.remove('hidden');
            this.statsSection.classList.remove('hidden');
        };

        reader.readAsText(file);
    }

    convertToPNG() {
        if (!this.svgData) return;

        const width = parseInt(this.widthInput.value);
        const height = parseInt(this.heightInput.value);
        const scale = parseFloat(this.scaleInput.value);

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        const svgBlob = new Blob([this.svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                this.pngBlob = blob;
                this.pngPreview.src = URL.createObjectURL(blob);
                
                this.pngDimensions.textContent = `${width * scale}x${height * scale}`;
                this.fileSize.textContent = this.formatFileSize(blob.size);
                
                this.previewSection.classList.remove('hidden');
                this.actionButtons.style.display = 'flex';
            }, 'image/png');
        };

        img.onerror = () => {
            alert('Error loading SVG. Please try another file.');
            URL.revokeObjectURL(url);
        };

        img.src = url;
    }

    downloadPNG() {
        if (!this.pngBlob) return;

        const link = document.createElement('a');
        const url = URL.createObjectURL(this.pngBlob);
        
        const width = parseInt(this.widthInput.value);
        const height = parseInt(this.heightInput.value);
        const scale = parseFloat(this.scaleInput.value);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `converted-${width * scale}x${height * scale}.png`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    reset() {
        this.svgData = null;
        this.pngBlob = null;
        this.fileInput.value = '';
        this.settingsSection.classList.add('hidden');
        this.statsSection.classList.add('hidden');
        this.previewSection.classList.add('hidden');
        this.actionButtons.style.display = 'none';
        this.widthInput.value = 800;
        this.heightInput.value = 600;
        this.scaleInput.value = 2;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SVGToPNGConverter();
});
