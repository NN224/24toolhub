class ImageFormatConverter {
    constructor() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.converterOptions = document.getElementById('converterOptions');
        this.outputFormat = document.getElementById('outputFormat');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityInput = document.getElementById('qualityInput');
        this.qualityValue = document.getElementById('qualityValue');
        this.convertBtn = document.getElementById('convertBtn');
        this.previewSection = document.getElementById('previewSection');
        this.originalPreview = document.getElementById('originalPreview');
        this.convertedPreview = document.getElementById('convertedPreview');
        this.originalSize = document.getElementById('originalSize');
        this.convertedSize = document.getElementById('convertedSize');
        this.sizeReduction = document.getElementById('sizeReduction');
        this.actionButtons = document.getElementById('actionButtons');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');

        this.originalFile = null;
        this.originalImage = null;
        this.convertedBlob = null;

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
                this.loadImage(files[0]);
            }
        });

        this.qualityInput.addEventListener('input', () => {
            this.qualityValue.textContent = this.qualityInput.value;
        });

        this.outputFormat.addEventListener('change', () => {
            if (this.outputFormat.value === 'image/png') {
                this.qualitySlider.style.display = 'none';
            } else {
                this.qualitySlider.style.display = 'block';
            }
        });

        this.convertBtn.addEventListener('click', () => this.convertImage());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file (PNG, JPG, or WebP)');
            return;
        }

        this.originalFile = file;
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.originalPreview.src = e.target.result;
                this.converterOptions.classList.remove('hidden');
                this.originalSize.textContent = this.formatFileSize(file.size);
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    convertImage() {
        if (!this.originalImage) return;

        const canvas = document.createElement('canvas');
        canvas.width = this.originalImage.width;
        canvas.height = this.originalImage.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.originalImage, 0, 0);

        const outputFormat = this.outputFormat.value;
        const quality = this.qualityInput.value / 100;

        canvas.toBlob((blob) => {
            this.convertedBlob = blob;
            this.convertedPreview.src = URL.createObjectURL(blob);
            this.convertedSize.textContent = this.formatFileSize(blob.size);
            
            const reduction = ((this.originalFile.size - blob.size) / this.originalFile.size * 100).toFixed(1);
            this.sizeReduction.textContent = reduction > 0 ? `-${reduction}%` : `+${Math.abs(reduction)}%`;
            
            this.previewSection.classList.remove('hidden');
            this.actionButtons.style.display = 'flex';
        }, outputFormat, quality);
    }

    downloadImage() {
        if (!this.convertedBlob) return;

        const link = document.createElement('a');
        const url = URL.createObjectURL(this.convertedBlob);
        
        const extension = this.outputFormat.value.split('/')[1];
        const originalName = this.originalFile.name.split('.')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${originalName}-converted.${extension}`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    reset() {
        this.originalFile = null;
        this.originalImage = null;
        this.convertedBlob = null;
        this.fileInput.value = '';
        this.converterOptions.classList.add('hidden');
        this.previewSection.classList.add('hidden');
        this.actionButtons.style.display = 'none';
        this.qualityInput.value = 90;
        this.qualityValue.textContent = 90;
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
    new ImageFormatConverter();
});
