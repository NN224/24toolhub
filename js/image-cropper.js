class ImageCropper {
    constructor() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.editorSection = document.getElementById('editorSection');
        this.canvas = document.getElementById('cropCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.cropOverlay = document.getElementById('cropOverlay');
        this.dimensionsDisplay = document.getElementById('dimensionsDisplay');
        this.previewSection = document.getElementById('previewSection');
        this.aspectButtons = document.querySelectorAll('.aspect-btn');
        this.cropBtn = document.getElementById('cropBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.newImageBtn = document.getElementById('newImageBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        this.image = null;
        this.cropArea = { x: 0, y: 0, width: 0, height: 0 };
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.aspectRatio = null;
        this.canvasRect = null;

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

        this.canvas.addEventListener('mousedown', (e) => this.startCrop(e));
        this.canvas.addEventListener('mousemove', (e) => this.updateCrop(e));
        this.canvas.addEventListener('mouseup', () => this.endCrop());
        this.canvas.addEventListener('mouseleave', () => this.endCrop());

        this.aspectButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.aspectButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const ratio = btn.dataset.ratio;
                this.aspectRatio = ratio === 'free' ? null : eval(ratio);
            });
        });

        this.cropBtn.addEventListener('click', () => this.performCrop());
        this.resetBtn.addEventListener('click', () => this.resetCrop());
        this.newImageBtn.addEventListener('click', () => this.uploadNewImage());
        this.downloadBtn.addEventListener('click', () => this.downloadCroppedImage());
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.displayImage();
                this.editorSection.classList.add('active');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayImage() {
        const containerWidth = this.canvas.parentElement.clientWidth - 40;
        const containerHeight = 600;
        
        let scale = Math.min(
            containerWidth / this.image.width,
            containerHeight / this.image.height,
            1
        );

        this.canvas.width = this.image.width * scale;
        this.canvas.height = this.image.height * scale;

        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        this.canvasRect = this.canvas.getBoundingClientRect();
    }

    startCrop(e) {
        this.isSelecting = true;
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - this.canvasRect.left;
        this.startY = e.clientY - this.canvasRect.top;
        this.cropArea = { x: this.startX, y: this.startY, width: 0, height: 0 };
        this.cropOverlay.classList.remove('active');
        this.previewSection.classList.remove('active');
    }

    updateCrop(e) {
        if (!this.isSelecting) return;

        const currentX = e.clientX - this.canvasRect.left;
        const currentY = e.clientY - this.canvasRect.top;

        let width = currentX - this.startX;
        let height = currentY - this.startY;

        if (this.aspectRatio) {
            const absWidth = Math.abs(width);
            height = (absWidth / this.aspectRatio) * Math.sign(height);
            if (Math.abs(height) > Math.abs(width / this.aspectRatio)) {
                width = (Math.abs(height) * this.aspectRatio) * Math.sign(width);
            }
        }

        this.cropArea = {
            x: width < 0 ? this.startX + width : this.startX,
            y: height < 0 ? this.startY + height : this.startY,
            width: Math.abs(width),
            height: Math.abs(height)
        };

        this.drawCropOverlay();
        this.updateDimensions();
    }

    endCrop() {
        if (this.isSelecting && this.cropArea.width > 5 && this.cropArea.height > 5) {
            this.cropOverlay.classList.add('active');
        }
        this.isSelecting = false;
    }

    drawCropOverlay() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.clearRect(
            this.cropArea.x,
            this.cropArea.y,
            this.cropArea.width,
            this.cropArea.height
        );

        this.ctx.drawImage(
            this.image,
            (this.cropArea.x / this.canvas.width) * this.image.width,
            (this.cropArea.y / this.canvas.height) * this.image.height,
            (this.cropArea.width / this.canvas.width) * this.image.width,
            (this.cropArea.height / this.canvas.height) * this.image.height,
            this.cropArea.x,
            this.cropArea.y,
            this.cropArea.width,
            this.cropArea.height
        );

        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            this.cropArea.x,
            this.cropArea.y,
            this.cropArea.width,
            this.cropArea.height
        );
    }

    updateDimensions() {
        const actualWidth = Math.round((this.cropArea.width / this.canvas.width) * this.image.width);
        const actualHeight = Math.round((this.cropArea.height / this.canvas.height) * this.image.height);
        this.dimensionsDisplay.textContent = `Crop Area: ${actualWidth} × ${actualHeight} px`;
    }

    performCrop() {
        if (this.cropArea.width === 0 || this.cropArea.height === 0) {
            alert('Please select an area to crop');
            return;
        }

        const scaleX = this.image.width / this.canvas.width;
        const scaleY = this.image.height / this.canvas.height;

        const sourceX = this.cropArea.x * scaleX;
        const sourceY = this.cropArea.y * scaleY;
        const sourceWidth = this.cropArea.width * scaleX;
        const sourceHeight = this.cropArea.height * scaleY;

        this.previewCanvas.width = sourceWidth;
        this.previewCanvas.height = sourceHeight;

        this.previewCtx.drawImage(
            this.image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            sourceWidth,
            sourceHeight
        );

        this.previewSection.classList.add('active');
    }

    resetCrop() {
        this.cropArea = { x: 0, y: 0, width: 0, height: 0 };
        this.cropOverlay.classList.remove('active');
        this.previewSection.classList.remove('active');
        this.dimensionsDisplay.textContent = 'Select an area to crop';
        this.displayImage();
    }

    uploadNewImage() {
        this.fileInput.value = '';
        this.editorSection.classList.remove('active');
        this.previewSection.classList.remove('active');
        this.resetCrop();
    }

    downloadCroppedImage() {
        const link = document.createElement('a');
        link.download = 'cropped-image.png';
        link.href = this.previewCanvas.toDataURL();
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageCropper();
});
