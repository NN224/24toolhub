// AI Chatbot for 24ToolHub
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.messageCount = 0;
        this.maxMessages = 5;
        this.resetTime = Date.now() + 60000; // Reset after 1 minute
        this.cacheKey = 'chatbot_cache';
        this.historyKey = 'chatbot_history';
        this.init();
        this.loadConversationHistory();
        this.initCache();
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

        // Rating buttons (event delegation for dynamically added buttons)
        this.messagesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-btn')) {
                const messageId = e.target.getAttribute('data-message-id');
                const rating = e.target.getAttribute('data-rating');
                this.handleRating(messageId, rating);
            }
        });

        // Action buttons
        document.getElementById('export-btn').addEventListener('click', () => this.exportConversation());
        document.getElementById('clear-history-btn').addEventListener('click', () => this.confirmClearHistory());
        document.getElementById('dark-mode-btn').addEventListener('click', () => this.toggleDarkMode());

        // Enhanced welcome message
        this.showEnhancedWelcome();
        
        // Update rate limit counter
        this.updateRateLimitCounter();
        
        // Load dark mode preference
        this.loadDarkModePreference();
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
                        <div class="chatbot-actions">
                            <button id="export-btn" class="action-btn" title="Export conversation / تصدير المحادثة">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                                </svg>
                            </button>
                            <button id="clear-history-btn" class="action-btn" title="Clear history / مسح السجل">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                            <button id="dark-mode-btn" class="action-btn" title="Toggle dark mode / تبديل الوضع الداكن">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                                </svg>
                            </button>
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

    addMessage(content, isUser = false, messageId = null) {
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
            
            // Add copy button for bot messages
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-message-btn';
            copyBtn.innerHTML = '📋';
            copyBtn.title = 'Copy message / نسخ الرسالة';
            copyBtn.addEventListener('click', () => {
                const textContent = contentDiv.textContent;
                navigator.clipboard.writeText(textContent).then(() => {
                    copyBtn.innerHTML = '✅';
                    setTimeout(() => {
                        copyBtn.innerHTML = '📋';
                    }, 2000);
                });
            });
            messageDiv.appendChild(copyBtn);
            
            // Add rating buttons for bot messages
            if (messageId) {
                const ratingDiv = document.createElement('div');
                ratingDiv.className = 'message-rating';
                ratingDiv.innerHTML = `
                    <span class="rating-prompt">Was this helpful?</span>
                    <button class="rating-btn thumbs-up" data-message-id="${messageId}" data-rating="positive" title="Helpful">
                        👍
                    </button>
                    <button class="rating-btn thumbs-down" data-message-id="${messageId}" data-rating="negative" title="Not helpful">
                        👎
                    </button>
                `;
                messageDiv.appendChild(ratingDiv);
            }
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
        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.addMessage(content, false, messageId);
        
        // Add suggested questions after bot response
        this.showSuggestedQuestions(content);
    }

    showSuggestedQuestions(botResponse) {
        // Remove any existing suggested questions
        const existing = document.querySelectorAll('.suggested-questions');
        existing.forEach(el => el.remove());

        // Generate smart suggestions based on response content
        const suggestions = this.generateSmartSuggestions(botResponse);
        
        if (suggestions.length === 0) return;

        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggested-questions';
        
        const header = document.createElement('div');
        header.className = 'suggestions-header';
        header.textContent = '💡 Suggested questions:';
        suggestionsDiv.appendChild(header);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'suggestions-buttons';
        
        suggestions.forEach(question => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = question;
            btn.addEventListener('click', () => {
                this.input.value = question;
                this.sendMessage();
                suggestionsDiv.remove();
            });
            buttonsContainer.appendChild(btn);
        });
        
        suggestionsDiv.appendChild(buttonsContainer);
        this.messagesContainer.appendChild(suggestionsDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    generateSmartSuggestions(response) {
        const suggestions = [];
        const responseLower = response.toLowerCase();

        // Tool-specific follow-ups
        if (responseLower.includes('json')) {
            suggestions.push('How to validate JSON?', 'JSON to CSV conversion?');
        } else if (responseLower.includes('image') || responseLower.includes('compress')) {
            suggestions.push('Best image formats?', 'How to resize images?');
        } else if (responseLower.includes('encrypt') || responseLower.includes('hash')) {
            suggestions.push('What is SHA-256?', 'Base64 encoding?');
        } else if (responseLower.includes('seo') || responseLower.includes('website')) {
            suggestions.push('PageSpeed optimization?', 'DNS lookup tool?');
        } else if (responseLower.includes('text') || responseLower.includes('string')) {
            suggestions.push('Case converter?', 'Word counter?');
        } else if (responseLower.includes('qr')) {
            suggestions.push('Generate QR code?', 'Barcode generator?');
        } else {
            // Generic helpful questions
            suggestions.push('What tools do you have?', 'Most popular tools?');
        }

        return suggestions.slice(0, 2); // Max 2 suggestions
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

        // Check cache first
        const cachedResponse = this.getCachedResponse(message);
        if (cachedResponse) {
            this.addBotMessage(cachedResponse + '\n\n💾 (Cached response)');
            this.conversationHistory.push({ role: 'model', content: cachedResponse });
            this.saveConversationHistory();
            this.sendBtn.disabled = false;
            this.input.focus();
            return;
        }

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

            // Extract and track tool mentions
            this.extractAndTrackTools(data.response);

            // Cache the response
            this.setCachedResponse(message, data.response);
            
            // Save conversation history
            this.saveConversationHistory();

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

        // Get trending tools from analytics or use defaults
        const trendingTools = this.getTrendingTools();
        let popularTools = trendingTools.length >= 3 ? trendingTools.slice(0, 3) : [
            { name: 'JSON Formatter', url: '/tools/json-formatter.html' },
            { name: 'Image Compressor', url: '/tools/image-compressor.html' },
            { name: 'QR Code Generator', url: '/tools/qr-code-generator.html' }
        ];

        const toolsList = popularTools.map(tool => 
            `<a href="${tool.url}" target="_blank" rel="noopener">${tool.name}</a>`
        ).join(', ');

        let welcomeMessage = `${greeting}\n\nأنا مساعدك الذكي في 24ToolHub. لدي أكثر من 70 أداة مجانية!\n\nI'm your AI assistant at 24ToolHub. I have 70+ free tools!\n\n🔥 ${trendingTools.length > 0 ? 'Your Trending Tools' : 'Trending Today'}: ${toolsList}`;

        // Show analytics summary if available
        const analytics = this.getAnalytics();
        if (analytics.totalRatings > 0) {
            welcomeMessage += `\n\n📊 Satisfaction Rate: ${analytics.satisfactionRate}% (${analytics.totalRatings} ratings)`;
        }

        // Context-aware suggestions based on current page
        const contextSuggestion = this.getContextAwareSuggestion();
        if (contextSuggestion) {
            welcomeMessage += `\n\n${contextSuggestion}`;
        }

        welcomeMessage += '\n\nClick a category below or ask me anything!';

        this.addBotMessage(welcomeMessage);
    }

    getContextAwareSuggestion() {
        const currentPath = window.location.pathname;
        
        // Define related tools for each category
        const relatedTools = {
            'json-formatter': {
                message: '💡 Since you\'re viewing JSON Formatter, you might also like:',
                tools: [
                    { name: 'JSON to CSV', url: '/tools/json-to-csv.html' },
                    { name: 'JSON to XML', url: '/tools/json-to-xml.html' },
                    { name: 'JSON Path Finder', url: '/tools/json-path-finder.html' }
                ]
            },
            'image-compressor': {
                message: '💡 Also check out these image tools:',
                tools: [
                    { name: 'Image Resizer', url: '/tools/image-resizer.html' },
                    { name: 'Image Format Converter', url: '/tools/image-format-converter.html' },
                    { name: 'Image Cropper', url: '/tools/image-cropper.html' }
                ]
            },
            'csv-to-json': {
                message: '💡 Related conversion tools:',
                tools: [
                    { name: 'JSON to CSV', url: '/tools/json-to-csv.html' },
                    { name: 'XML to JSON', url: '/tools/xml-to-json.html' },
                    { name: 'YAML to JSON', url: '/tools/yaml-to-json.html' }
                ]
            },
            'base64': {
                message: '💡 More encoding tools:',
                tools: [
                    { name: 'URL Encoder', url: '/tools/url-encoder.html' },
                    { name: 'HTML Entity Encoder', url: '/tools/html-entity-encoder.html' },
                    { name: 'Escape/Unescape', url: '/tools/escape-unescape.html' }
                ]
            },
            'minifier': {
                message: '💡 Optimize your code with:',
                tools: [
                    { name: 'CSS Minifier', url: '/tools/css-minifier.html' },
                    { name: 'HTML Minifier', url: '/tools/html-minifier.html' },
                    { name: 'JavaScript Minifier', url: '/tools/javascript-minifier.html' }
                ]
            }
        };

        // Check if current page matches any tool category
        for (const [key, data] of Object.entries(relatedTools)) {
            if (currentPath.includes(key)) {
                const toolLinks = data.tools.map(tool => 
                    `<a href="${tool.url}" target="_blank" rel="noopener">${tool.name}</a>`
                ).join(', ');
                return `${data.message} ${toolLinks}`;
            }
        }

        return null;
    }

    // Conversation History Management
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem(this.historyKey);
            if (saved) {
                const data = JSON.parse(saved);
                // Only load if it's from today
                if (data.date === new Date().toDateString()) {
                    this.conversationHistory = data.history || [];
                    
                    // Restore previous messages in UI (max 10)
                    const recentMessages = data.messages?.slice(-10) || [];
                    if (recentMessages.length > 0) {
                        // Add a separator
                        const separator = document.createElement('div');
                        separator.className = 'history-separator';
                        separator.textContent = '📜 Previous conversation';
                        this.messagesContainer.appendChild(separator);
                        
                        recentMessages.forEach(msg => {
                            this.addMessage(msg.content, msg.isUser);
                        });
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load conversation history:', e);
        }
    }

    saveConversationHistory() {
        try {
            const messages = Array.from(this.messagesContainer.children)
                .filter(el => el.classList.contains('chatbot-message'))
                .map(el => ({
                    content: el.querySelector('.message-content').textContent,
                    isUser: el.classList.contains('user')
                }));

            localStorage.setItem(this.historyKey, JSON.stringify({
                date: new Date().toDateString(),
                history: this.conversationHistory,
                messages: messages.slice(-20) // Keep last 20 messages
            }));
        } catch (e) {
            console.warn('Failed to save conversation history:', e);
        }
    }

    clearHistory() {
        localStorage.removeItem(this.historyKey);
        this.conversationHistory = [];
    }

    // Smart Caching System
    initCache() {
        try {
            const saved = localStorage.getItem(this.cacheKey);
            this.cache = saved ? JSON.parse(saved) : {};
            
            // Clean old cache (older than 24 hours)
            const now = Date.now();
            for (const key in this.cache) {
                if (now - this.cache[key].timestamp > 24 * 60 * 60 * 1000) {
                    delete this.cache[key];
                }
            }
            this.saveCache();
        } catch (e) {
            this.cache = {};
        }
    }

    getCachedResponse(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const cached = this.cache[normalizedQuery];
        
        if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
            return cached.response;
        }
        return null;
    }

    setCachedResponse(query, response) {
        const normalizedQuery = query.toLowerCase().trim();
        this.cache[normalizedQuery] = {
            response: response,
            timestamp: Date.now()
        };
        this.saveCache();
    }

    saveCache() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
        } catch (e) {
            console.warn('Failed to save cache:', e);
        }
    }

    // Analytics & Learning System
    handleRating(messageId, rating) {
        try {
            // Get or create analytics data
            let analytics = JSON.parse(localStorage.getItem('chatbot_analytics') || '{}');
            
            if (!analytics.ratings) analytics.ratings = {};
            if (!analytics.ratingCount) analytics.ratingCount = { positive: 0, negative: 0 };
            
            // Save rating
            analytics.ratings[messageId] = {
                rating: rating,
                timestamp: Date.now(),
                date: new Date().toDateString()
            };
            
            // Update counts
            analytics.ratingCount[rating]++;
            
            // Save to localStorage
            localStorage.setItem('chatbot_analytics', JSON.stringify(analytics));
            
            // Visual feedback
            const ratingDiv = document.querySelector(`[data-message-id="${messageId}"]`)?.closest('.message-rating');
            if (ratingDiv) {
                ratingDiv.innerHTML = `<span class="rating-thanks">✨ شكراً على التقييم! / Thanks for the feedback!</span>`;
            }
            
            // Track with Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_rating', {
                    event_category: 'engagement',
                    event_label: rating,
                    value: rating === 'positive' ? 1 : 0
                });
            }
            
        } catch (e) {
            console.warn('Failed to save rating:', e);
        }
    }

    extractAndTrackTools(response) {
        try {
            // Extract tool links from markdown format [Tool Name](url)
            const toolRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let match;
            
            while ((match = toolRegex.exec(response)) !== null) {
                const toolName = match[1];
                const toolUrl = match[2];
                
                // Only track if it's an internal tool link
                if (toolUrl.startsWith('/tools/') || toolUrl.includes('/tools/')) {
                    this.trackToolRequest(toolName, toolUrl);
                }
            }
        } catch (e) {
            console.warn('Failed to extract tools:', e);
        }
    }

    trackToolRequest(toolName, toolUrl) {
        try {
            let analytics = JSON.parse(localStorage.getItem('chatbot_analytics') || '{}');
            
            if (!analytics.toolRequests) analytics.toolRequests = {};
            
            if (!analytics.toolRequests[toolName]) {
                analytics.toolRequests[toolName] = {
                    count: 0,
                    url: toolUrl,
                    lastRequested: null
                };
            }
            
            analytics.toolRequests[toolName].count++;
            analytics.toolRequests[toolName].lastRequested = Date.now();
            
            localStorage.setItem('chatbot_analytics', JSON.stringify(analytics));
        } catch (e) {
            console.warn('Failed to track tool request:', e);
        }
    }

    getTrendingTools() {
        try {
            const analytics = JSON.parse(localStorage.getItem('chatbot_analytics') || '{}');
            const toolRequests = analytics.toolRequests || {};
            
            // Sort tools by request count
            const sorted = Object.entries(toolRequests)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5);
            
            return sorted.map(([name, data]) => ({
                name: name,
                url: data.url,
                count: data.count
            }));
        } catch (e) {
            return [];
        }
    }

    getAnalytics() {
        try {
            const analytics = JSON.parse(localStorage.getItem('chatbot_analytics') || '{}');
            return {
                totalRatings: (analytics.ratingCount?.positive || 0) + (analytics.ratingCount?.negative || 0),
                positiveRatings: analytics.ratingCount?.positive || 0,
                negativeRatings: analytics.ratingCount?.negative || 0,
                satisfactionRate: analytics.ratingCount ? 
                    Math.round((analytics.ratingCount.positive / ((analytics.ratingCount.positive + analytics.ratingCount.negative) || 1)) * 100) : 0,
                trendingTools: this.getTrendingTools()
            };
        } catch (e) {
            return {
                totalRatings: 0,
                positiveRatings: 0,
                negativeRatings: 0,
                satisfactionRate: 0,
                trendingTools: []
            };
        }
    }

    // Advanced Features (Phase 4)
    exportConversation() {
        try {
            const messages = Array.from(this.messagesContainer.children)
                .filter(el => el.classList.contains('chatbot-message'))
                .map(el => {
                    const isUser = el.classList.contains('user');
                    const content = el.querySelector('.message-content').textContent;
                    return `${isUser ? 'You' : 'AI Assistant'}: ${content}`;
                })
                .join('\n\n');

            if (!messages) {
                this.showError('No conversation to export / لا توجد محادثة للتصدير');
                return;
            }

            const header = `24ToolHub AI Assistant - Conversation Export\nDate: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
            const fullContent = header + messages;

            // Create download
            const blob = new Blob([fullContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chatbot-conversation-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Show success message
            this.showError('✅ Conversation exported! / تم تصدير المحادثة!');

            // Track export
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_export', {
                    event_category: 'engagement'
                });
            }
        } catch (e) {
            console.warn('Export failed:', e);
            this.showError('Export failed / فشل التصدير');
        }
    }

    confirmClearHistory() {
        if (confirm('Are you sure you want to clear the conversation history?\n\nهل أنت متأكد من حذف سجل المحادثات؟')) {
            this.clearHistory();
            
            // Clear messages UI
            const messages = this.messagesContainer.querySelectorAll('.chatbot-message, .history-separator');
            messages.forEach(msg => msg.remove());
            
            // Show welcome message again
            this.showEnhancedWelcome();
            
            this.showError('✅ History cleared! / تم مسح السجل!');
            
            // Track clear
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_clear_history', {
                    event_category: 'engagement'
                });
            }
        }
    }

    toggleDarkMode() {
        const container = document.querySelector('.chatbot-container');
        const isDark = container.classList.toggle('dark-mode');
        
        // Save preference
        localStorage.setItem('chatbot_dark_mode', isDark);
        
        // Track toggle
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chatbot_dark_mode', {
                event_category: 'engagement',
                event_label: isDark ? 'enabled' : 'disabled'
            });
        }
    }

    loadDarkModePreference() {
        const isDark = localStorage.getItem('chatbot_dark_mode') === 'true';
        if (isDark) {
            document.querySelector('.chatbot-container').classList.add('dark-mode');
        }
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
