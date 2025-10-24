class SpeechToTextConverter {
    constructor() {
        this.micButton = document.getElementById('micButton');
        this.statusText = document.getElementById('statusText');
        this.transcriptArea = document.getElementById('transcriptArea');
        this.languageSelect = document.getElementById('languageSelect');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.wordCount = document.getElementById('wordCount');
        this.charCount = document.getElementById('charCount');
        this.sentenceCount = document.getElementById('sentenceCount');
        this.errorMessage = document.getElementById('errorMessage');

        this.recognition = null;
        this.isRecording = false;
        this.finalTranscript = '';

        this.init();
    }

    init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
            this.micButton.disabled = true;
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.languageSelect.value;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.micButton.addEventListener('click', () => this.toggleRecording());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.clearBtn.addEventListener('click', () => this.clear());
        
        this.languageSelect.addEventListener('change', () => {
            if (this.recognition) {
                this.recognition.lang = this.languageSelect.value;
            }
        });

        this.transcriptArea.addEventListener('input', () => this.updateStats());

        if (this.recognition) {
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.micButton.classList.add('recording');
                this.statusText.classList.add('recording');
                this.statusText.textContent = 'Listening... Speak now';
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.micButton.classList.remove('recording');
                this.statusText.classList.remove('recording');
                this.statusText.textContent = 'Click the microphone to start';
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        this.finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                this.transcriptArea.value = this.finalTranscript + interimTranscript;
                this.updateStats();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                
                let errorMsg = 'An error occurred: ';
                switch(event.error) {
                    case 'no-speech':
                        errorMsg += 'No speech detected. Please try again.';
                        break;
                    case 'audio-capture':
                        errorMsg += 'No microphone found. Please check your microphone.';
                        break;
                    case 'not-allowed':
                        errorMsg += 'Microphone permission denied. Please allow microphone access.';
                        break;
                    default:
                        errorMsg += event.error;
                }
                
                this.showError(errorMsg);
                this.stopRecording();
            };
        }
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        try {
            this.hideError();
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showError('Failed to start recording. Please try again.');
        }
    }

    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }

    updateStats() {
        const text = this.transcriptArea.value.trim();
        
        const words = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
        const chars = text.length;
        const sentences = text ? (text.match(/[.!?]+/g) || []).length : 0;

        this.wordCount.textContent = words;
        this.charCount.textContent = chars;
        this.sentenceCount.textContent = sentences;
    }

    download() {
        const text = this.transcriptArea.value;
        if (!text) {
            this.showError('No text to download. Please record some speech first.');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `transcript-${date}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    copy() {
        const text = this.transcriptArea.value;
        if (!text) {
            this.showError('No text to copy. Please record some speech first.');
            return;
        }

        this.transcriptArea.select();
        document.execCommand('copy');
        
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
        }, 2000);
    }

    clear() {
        if (this.isRecording) {
            this.stopRecording();
        }
        
        this.transcriptArea.value = '';
        this.finalTranscript = '';
        this.updateStats();
        this.hideError();
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SpeechToTextConverter();
});
