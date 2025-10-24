// AI Chatbot for 24ToolHub
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.messageCount = 0;
        this.maxMessages = 5;
        this.resetTime = Date.now() + 60000; // Reset after 1 minute
        this.init();
    }

    init() {
        // Create chatbot HTML
        this.createChatbotHTML();
        
        // Get elements
        this.button = document.getElementById('chatbot-button');
        this.window = document.getElementById('chatbot-window');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');

        // Event listeners
        this.button.addEventListener('click', () => this.toggle());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick reply buttons
        this.quickReplies = document.querySelectorAll('.quick-reply-btn');
        this.quickReplies.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                this.input.value = query;
                this.sendMessage();
            });
        });

        // Enhanced welcome message
        this.showEnhancedWelcome();
        
        // Update rate limit counter
        this.updateRateLimitCounter();
    }

    createChatbotHTML() {
        const html = `
            <div class="chatbot-container">
                <!-- Chat Button -->
                <button id="chatbot-button" class="chatbot-button" aria-label="Open AI Assistant">
                    <svg class="chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        <circle cx="12" cy="11" r="1"/>
                        <circle cx="8" cy="11" r="1"/>
                        <circle cx="16" cy="11" r="1"/>
                    </svg>
                    <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                </button>

                <!-- Chat Window -->
                <div id="chatbot-window" class="chatbot-window">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-avatar">🤖</div>
                        <div class="chatbot-title">
                            <h3>AI Assistant</h3>
                            <p id="chatbot-subtitle">Always here to help</p>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div id="chatbot-messages" class="chatbot-messages">
                        <!-- Messages will be added here dynamically -->
                    </div>

                    <!-- Quick Reply Buttons -->
                    <div id="quick-replies" class="quick-replies">
                        <button class="quick-reply-btn" data-query="Show me text processing tools">📝 Text Tools</button>
                        <button class="quick-reply-btn" data-query="I need conversion tools">🔄 Converters</button>
                        <button class="quick-reply-btn" data-query="Show me generator tools">🎨 Generators</button>
                        <button class="quick-reply-btn" data-query="I need encryption tools">🔒 Encryption</button>
                        <button class="quick-reply-btn" data-query="Show me website analysis tools">📊 Website Analysis</button>
                        <button class="quick-reply-btn" data-query="I need image tools">🖼️ Image Tools</button>
                    </div>

                    <!-- Input Area -->
                    <div class="chatbot-input-area">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            class="chatbot-input" 
                            placeholder="اكتب رسالتك... / Type your message..."
                            autocomplete="off"
                        />
                        <button id="chatbot-send" class="chatbot-send-btn" aria-label="Send message">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.button.classList.toggle('active', this.isOpen);
        this.window.classList.toggle('open', this.isOpen);
        
        if (this.isOpen) {
            this.input.focus();
            // Track chatbot open
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_opened', {
                    event_category: 'engagement'
                });
            }
        }
    }

    addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (!isUser) {
            // Format bot messages with proper structure
            let formattedContent = content
                // Convert markdown-style links to HTML with styling
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
                // Convert bullet points to proper list items
                .replace(/\*\s+\*\*([^*]+)\*\*:/g, '<br><strong>• $1:</strong>')
                .replace(/^\*\s+/gm, '• ')
                // Convert line breaks to <br> tags
                .replace(/\n/g, '<br>');
            
            contentDiv.innerHTML = formattedContent;
        } else {
            // User messages - simple text
            contentDiv.textContent = content;
        }
        
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addBotMessage(content) {
        this.addMessage(content, false);
    }

    addUserMessage(content) {
        this.addMessage(content, true);
    }

    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot';
        typingDiv.id = 'typing-indicator';
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        
        typingDiv.appendChild(indicator);
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.messagesContainer.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    async sendMessage() {
        const message = this.input.value.trim();
        
        if (!message) return;

        // Check rate limit
        if (Date.now() > this.resetTime) {
            this.messageCount = 0;
            this.resetTime = Date.now() + 60000;
        }

        if (this.messageCount >= this.maxMessages) {
            this.showError('⏳ Rate limit reached. Please wait a moment. / تم الوصول إلى الحد الأقصى. يرجى الانتظار قليلاً.');
            return;
        }

        this.messageCount++;
        this.updateRateLimitCounter();

        // Add user message
        this.addUserMessage(message);
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Clear input
        this.input.value = '';
        this.sendBtn.disabled = true;

        // Show typing indicator
        this.showTyping();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory.slice(-10) // Keep last 10 messages
                })
            });

            this.hideTyping();

            if (!response.ok) {
                if (response.status === 429) {
                    const data = await response.json();
                    this.showError(data.errorAr || data.error);
                } else {
                    throw new Error('Network response was not ok');
                }
                return;
            }

            const data = await response.json();
            
            // Add bot response
            this.addBotMessage(data.response);
            this.conversationHistory.push({ role: 'model', content: data.response });

            // Track message sent
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_message', {
                    event_category: 'engagement'
                });
            }

        } catch (error) {
            this.hideTyping();
            console.error('Chat error:', error);
            this.showError('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى. / Sorry, an error occurred. Please try again.');
        } finally {
            this.sendBtn.disabled = false;
            this.input.focus();
        }
    }

    updateRateLimitCounter() {
        const subtitle = document.getElementById('chatbot-subtitle');
        const remaining = this.maxMessages - this.messageCount;
        
        if (remaining <= 2 && remaining > 0) {
            subtitle.textContent = `⏳ ${remaining} messages remaining`;
            subtitle.style.color = '#ff9800';
        } else if (remaining === 0) {
            subtitle.textContent = '⏳ Please wait...';
            subtitle.style.color = '#f44336';
        } else {
            subtitle.textContent = 'Always here to help';
            subtitle.style.color = 'rgba(255, 255, 255, 0.9)';
        }
    }

    showEnhancedWelcome() {
        // Get time-based greeting
        const hour = new Date().getHours();
        let greeting = 'مرحباً! 👋';
        
        if (hour >= 5 && hour < 12) {
            greeting = 'صباح الخير! ☀️';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'مساء الخير! 🌤️';
        } else if (hour >= 18 && hour < 22) {
            greeting = 'مساء الخير! 🌙';
        } else {
            greeting = 'مساء الخير! 🌜';
        }

        // Popular tools
        const popularTools = [
            { name: 'JSON Formatter', url: '/tools/json-formatter.html' },
            { name: 'Image Compressor', url: '/tools/image-compressor.html' },
            { name: 'QR Code Generator', url: '/tools/qr-code-generator.html' }
        ];

        const toolsList = popularTools.map(tool => 
            `<a href="${tool.url}" target="_blank" rel="noopener">${tool.name}</a>`
        ).join(', ');

        const welcomeMessage = `${greeting}\n\nأنا مساعدك الذكي في 24ToolHub. لدي أكثر من 70 أداة مجانية!\n\nI'm your AI assistant at 24ToolHub. I have 70+ free tools!\n\n🔥 Trending Today: ${toolsList}\n\nClick a category below or ask me anything!`;

        this.addBotMessage(welcomeMessage);
    }
}

// Initialize chatbot when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Chatbot();
    });
} else {
    new Chatbot();
}
