class ColorConverter {
    constructor() {
        this.rgbR = document.getElementById('rgbR');
        this.rgbG = document.getElementById('rgbG');
        this.rgbB = document.getElementById('rgbB');
        this.hexInput = document.getElementById('hexInput');
        this.rgbToHexBtn = document.getElementById('rgbToHexBtn');
        this.hexToRgbBtn = document.getElementById('hexToRgbBtn');
        this.colorPreview = document.getElementById('colorPreview');
        this.rgbDisplay = document.getElementById('rgbDisplay');
        this.hexDisplay = document.getElementById('hexDisplay');
        this.cssRgbDisplay = document.getElementById('cssRgbDisplay');
        this.cssHexDisplay = document.getElementById('cssHexDisplay');
        this.colorPresets = document.getElementById('colorPresets');

        this.popularColors = [
            { name: 'Red', hex: '#FF0000' },
            { name: 'Green', hex: '#00FF00' },
            { name: 'Blue', hex: '#0000FF' },
            { name: 'Yellow', hex: '#FFFF00' },
            { name: 'Cyan', hex: '#00FFFF' },
            { name: 'Magenta', hex: '#FF00FF' },
            { name: 'Orange', hex: '#FFA500' },
            { name: 'Purple', hex: '#800080' },
            { name: 'Pink', hex: '#FFC0CB' },
            { name: 'Brown', hex: '#A52A2A' },
            { name: 'Navy', hex: '#000080' },
            { name: 'Teal', hex: '#008080' }
        ];

        this.init();
    }

    init() {
        // Event listeners for RGB to HEX
        this.rgbToHexBtn.addEventListener('click', () => this.rgbToHex());
        
        // Auto-convert on RGB input change
        [this.rgbR, this.rgbG, this.rgbB].forEach(input => {
            input.addEventListener('input', () => this.rgbToHex());
        });

        // Event listeners for HEX to RGB
        this.hexToRgbBtn.addEventListener('click', () => this.hexToRgb());
        
        // Auto-convert on HEX input change
        this.hexInput.addEventListener('input', () => this.hexToRgb());

        // Initialize presets
        this.initializePresets();

        // Initial conversion
        this.rgbToHex();
    }

    rgbToHex() {
        let r = parseInt(this.rgbR.value) || 0;
        let g = parseInt(this.rgbG.value) || 0;
        let b = parseInt(this.rgbB.value) || 0;

        // Clamp values between 0-255
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        // Update inputs to clamped values
        this.rgbR.value = r;
        this.rgbG.value = g;
        this.rgbB.value = b;

        // Convert to HEX
        const hex = '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();

        // Update displays
        this.hexInput.value = hex;
        this.updateDisplay(r, g, b, hex);
    }

    hexToRgb() {
        let hex = this.hexInput.value.trim();
        
        // Remove # if present
        hex = hex.replace(/^#/, '');

        // Validate hex
        if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
            // Try 3-digit hex
            if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
                hex = hex.split('').map(c => c + c).join('');
            } else {
                return;
            }
        }

        // Convert to RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Update RGB inputs
        this.rgbR.value = r;
        this.rgbG.value = g;
        this.rgbB.value = b;

        // Update displays
        this.updateDisplay(r, g, b, '#' + hex.toUpperCase());
    }

    updateDisplay(r, g, b, hex) {
        const rgb = `rgb(${r}, ${g}, ${b})`;
        
        // Update color preview
        this.colorPreview.style.backgroundColor = rgb;
        
        // Update displays
        this.rgbDisplay.textContent = rgb;
        this.hexDisplay.textContent = hex;
        this.cssRgbDisplay.textContent = rgb;
        this.cssHexDisplay.textContent = hex;

        // Add click to copy
        [this.rgbDisplay, this.hexDisplay, this.cssRgbDisplay, this.cssHexDisplay].forEach(el => {
            el.style.cursor = 'pointer';
            el.onclick = () => {
                navigator.clipboard.writeText(el.textContent);
                const original = el.textContent;
                el.textContent = 'Copied!';
                setTimeout(() => {
                    el.textContent = original;
                }, 1000);
            };
        });
    }

    initializePresets() {
        this.popularColors.forEach(color => {
            const preset = document.createElement('div');
            preset.className = 'preset-color';
            preset.style.backgroundColor = color.hex;
            preset.textContent = color.name;
            preset.title = color.hex;
            
            preset.addEventListener('click', () => {
                this.hexInput.value = color.hex;
                this.hexToRgb();
            });
            
            this.colorPresets.appendChild(preset);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorConverter();
});
