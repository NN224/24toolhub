// SEO Analyzer Tool

// Configuration for the backend API
const SEO_API_ENDPOINT = '/analyze-seo';

class SEOAnalyzer {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
    }

    bindEvents() {
        const startAnalysisBtn = document.getElementById('startAnalysis');
        const clearResultsBtn = document.getElementById('clearResults');
        const websiteUrlInput = document.getElementById('websiteUrl');

        startAnalysisBtn.addEventListener('click', () => this.startSEOAnalysis());
        clearResultsBtn.addEventListener('click', () => this.clearResults());
        websiteUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startSEOAnalysis();
            }
        });
    }

    setupUI() {
        // Add custom styles for SEO analyzer
        const style = document.createElement('style');
        style.textContent = `
            .score-section {
                text-align: center;
                margin: 2rem 0;
            }
            
            .score-circle {
                display: inline-block;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: conic-gradient(var(--accent-primary) 0deg, var(--accent-primary) 0deg, #e5e7eb 0deg);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                margin: 0 auto;
            }
            
            .score-circle::before {
                content: '';
                position: absolute;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: var(--bg-primary);
                z-index: 1;
            }
            
            .score-value {
                font-size: 2rem;
                font-weight: bold;
                color: var(--accent-primary);
                z-index: 2;
                position: relative;
            }
            
            .score-label {
                font-size: 0.875rem;
                color: var(--text-secondary);
                z-index: 2;
                position: relative;
            }
            
            .analysis-categories {
                margin: 2rem 0;
            }
            
            .analysis-category {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .category-title {
                color: var(--accent-primary);
                margin-bottom: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .category-score {
                font-size: 1.5rem;
                font-weight: bold;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                display: inline-block;
                margin-bottom: 1rem;
            }
            
            .score-excellent {
                background: #10b981;
                color: white;
            }
            
            .score-good {
                background: #3b82f6;
                color: white;
            }
            
            .score-fair {
                background: #f59e0b;
                color: white;
            }
            
            .score-poor {
                background: #ef4444;
                color: white;
            }
            
            .category-details {
                color: var(--text-secondary);
            }
            
            .detail-item {
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .detail-item:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 500;
                color: var(--text-primary);
            }
            
            .detail-value {
                color: var(--text-secondary);
            }
            
            .detail-status {
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                font-weight: bold;
            }
            
            .status-good {
                background: #10b981;
                color: white;
            }
            
            .status-warning {
                background: #f59e0b;
                color: white;
            }
            
            .status-error {
                background: #ef4444;
                color: white;
            }
            
            .recommendations-section {
                margin-top: 2rem;
            }
            
            .recommendations-heading {
                color: var(--accent-primary);
                margin-bottom: 1rem;
            }
            
            .recommendations-list {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
            }
            
            .recommendation-item {
                padding: 0.75rem 0;
                border-bottom: 1px solid var(--border-color);
            }
            
            .recommendation-item:last-child {
                border-bottom: none;
            }
            
            .recommendation-title {
                font-weight: bold;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }
            
            .recommendation-description {
                color: var(--text-secondary);
                font-size: 0.875rem;
                margin-bottom: 0.5rem;
            }
            
            .recommendation-priority {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-weight: bold;
                display: inline-block;
            }
            
            .priority-high {
                background: #ef4444;
                color: white;
            }
            
            .priority-medium {
                background: #f59e0b;
                color: white;
            }
            
            .priority-low {
                background: #10b981;
                color: white;
            }
            
            .loading-indicator {
                text-align: center;
                padding: 2rem;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top: 4px solid var(--accent-primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    async startSEOAnalysis() {
        const websiteUrl = document.getElementById('websiteUrl').value.trim();
        
        if (!websiteUrl) {
            this.showNotification('Please enter a valid website URL', 'error');
            return;
        }

        if (!this.isValidUrl(websiteUrl)) {
            this.showNotification('Please enter a valid URL format (e.g., https://example.com)', 'error');
            return;
        }

        this.showLoading(true);
        this.hideResults();

        try {
            // Use the Express server for real SEO analysis
            const response = await fetch(`${SEO_API_ENDPOINT}?url=${encodeURIComponent(websiteUrl)}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze the URL.');
            }
            const analysisData = await response.json();
            const results = this.processRealAnalysis(websiteUrl, analysisData);
            this.displayResults(results);
        } catch (error) {
            this.showNotification(`Analysis failed: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    processRealAnalysis(url, data) {
        const categories = {};
        let overallScore = 0;

        // Meta analysis
        const metaAnalysis = this.analyzeMeta(data);
        categories.meta = metaAnalysis;
        overallScore += metaAnalysis.score;

        // Content analysis
        const contentAnalysis = this.analyzeContent(data);
        categories.content = contentAnalysis;
        overallScore += contentAnalysis.score;

        // Structure (URL-based)
        const structureAnalysis = this.analyzeUrl(new URL(url));
        categories.structure = structureAnalysis;
        overallScore += structureAnalysis.score;

        // Technical (Image Alt Tags)
        const technicalAnalysis = this.analyzeTechnical(data);
        categories.technical = technicalAnalysis;
        overallScore += technicalAnalysis.score;

        overallScore = Math.round(overallScore / 4);

        return {
            url: url,
            overallScore: overallScore,
            categories: categories,
            recommendations: this.generateRecommendations(categories)
        };
    }

    analyzeMeta(data) {
        let score = 0;
        const details = {};

        // Title Tag
        if (data.title.length > 10 && data.title.length < 60) {
            details.title = { value: `${data.title.text.substring(0, 30)}... (${data.title.length})`, status: 'good' };
            score += 30;
        } else {
            details.title = { value: `Length: ${data.title.length} (Ideal: 10-60)`, status: 'error' };
        }

        // Meta Description
        if (data.description.length > 70 && data.description.length < 160) {
            details.description = { value: `Length: ${data.description.length}`, status: 'good' };
            score += 30;
        } else {
            details.description = { value: `Length: ${data.description.length} (Ideal: 70-160)`, status: 'error' };
        }

        // Open Graph Tags
        if (data.ogTags.title && data.ogTags.description) {
            details.ogTags = { value: 'Present', status: 'good' };
            score += 20;
        } else {
            details.ogTags = { value: 'Missing', status: 'warning' };
        }

        return { score: Math.round(score * 100 / 80), details };
    }

    analyzeContent(data) {
        let score = 0;
        const details = {};

        // H1 Heading
        if (data.headings.h1 === 1) {
            details.h1 = { value: '1 H1 tag found', status: 'good' };
            score += 40;
        } else {
            details.h1 = { value: `${data.headings.h1} H1 tags found (Ideal: 1)`, status: 'error' };
        }

        // H2 Headings
        if (data.headings.h2 > 0) {
            details.h2 = { value: `${data.headings.h2} H2 tags found`, status: 'good' };
            score += 30;
        } else {
            details.h2 = { value: 'No H2 tags found', status: 'warning' };
        }

        return { score: Math.round(score * 100 / 70), details };
    }

    analyzeUrl(urlObj) {
        let score = 0;
        const details = {};
        
        // Check HTTPS
        if (urlObj.protocol === 'https:') {
            details.https = { value: 'Secure (HTTPS)', status: 'good' };
            score += 25;
        } else {
            details.https = { value: 'Not secure (HTTP)', status: 'error' };
        }
        
        // Check URL length
        if (urlObj.href.length <= 60) {
            details.urlLength = { value: 'Good length', status: 'good' };
            score += 20;
        } else if (urlObj.href.length <= 100) {
            details.urlLength = { value: 'Acceptable length', status: 'warning' };
            score += 10;
        } else {
            details.urlLength = { value: 'Too long', status: 'error' };
        }
        
        // Check for SEO-friendly structure
        const hasNumbers = /\d/.test(urlObj.pathname);
        const hasSpecialChars = /[^a-zA-Z0-9\-\/\.]/.test(urlObj.pathname);
        
        if (!hasSpecialChars && urlObj.pathname.includes('-')) {
            details.structure = { value: 'SEO-friendly', status: 'good' };
            score += 25;
        } else if (!hasSpecialChars) {
            details.structure = { value: 'Good structure', status: 'warning' };
            score += 15;
        } else {
            details.structure = { value: 'Needs improvement', status: 'error' };
        }
        
        // Check subdomain
        const subdomain = urlObj.hostname.split('.')[0];
        if (subdomain === 'www' || !urlObj.hostname.includes('.')) {
            details.subdomain = { value: 'Standard', status: 'good' };
            score += 10;
        } else {
            details.subdomain = { value: 'Has subdomain', status: 'warning' };
            score += 5;
        }
        
        return {
            score: Math.min(score, 100),
            details: details
        };
    }

    analyzeTechnical(data) {
        let score = 0;
        const details = {};

        // Image Alt Tags
        const altTagPercentage = data.images.total > 0 ? ((data.images.total - data.images.missingAlt) / data.images.total) * 100 : 100;
        if (altTagPercentage === 100) {
            details.altTags = { value: 'All images have alt tags', status: 'good' };
            score += 100;
        } else {
            details.altTags = { value: `${data.images.missingAlt} of ${data.images.total} images missing alt tags`, status: 'error' };
            score += altTagPercentage;
        }

        return { score: Math.round(score), details };
    }

    analyzeBasicMeta(urlObj) {
        let score = 30; // Base score since we can't analyze actual meta tags
        const details = {};
        
        details.title = { value: 'Cannot analyze from URL', status: 'warning' };
        details.description = { value: 'Cannot analyze from URL', status: 'warning' };
        details.keywords = { value: 'Cannot analyze from URL', status: 'warning' };
        details.ogTags = { value: 'Cannot analyze from URL', status: 'warning' };
        
        return {
            score: score,
            details: details
        };
    }

    analyzeBasicContent(urlObj) {
        let score = 30; // Base score since we can't analyze actual content
        const details = {};
        
        // Analyze URL path for content hints
        const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
        
        if (pathSegments.length > 0) {
            details.structure = { value: 'Has URL structure', status: 'good' };
            score += 20;
        } else {
            details.structure = { value: 'Root page', status: 'warning' };
            score += 10;
        }
        
        details.headings = { value: 'Cannot analyze from URL', status: 'warning' };
        details.content = { value: 'Cannot analyze from URL', status: 'warning' };
        details.images = { value: 'Cannot analyze from URL', status: 'warning' };
        
        return {
            score: score,
            details: details
        };
    }

    generateRecommendations(categories) {
        const recommendations = [];

        // Meta recommendations
        if (categories.meta.details.title.status === 'error') {
            recommendations.push({ title: 'Optimize Title Tag', description: 'Ensure your title is between 10 and 60 characters long.', priority: 'high' });
        }
        if (categories.meta.details.description.status === 'error') {
            recommendations.push({ title: 'Optimize Meta Description', description: 'Write a compelling meta description between 70 and 160 characters.', priority: 'high' });
        }

        // Content recommendations
        if (categories.content.details.h1.status === 'error') {
            recommendations.push({ title: 'Fix H1 Heading', description: 'Your page should have exactly one H1 heading.', priority: 'high' });
        }
        if (categories.content.details.h2.status === 'warning') {
            recommendations.push({ title: 'Use H2 Headings', description: 'Use H2 headings to structure your content for better readability and SEO.', priority: 'medium' });
        }

        // Technical recommendations
        if (categories.technical.details.altTags && categories.technical.details.altTags.status === 'error') {
            recommendations.push({ title: 'Add Image Alt Tags', description: 'Add descriptive alt tags to all your images for accessibility and SEO.', priority: 'medium' });
        }

        if (recommendations.length === 0) {
            recommendations.push({ title: 'Great Work!', description: 'Your on-page SEO is looking strong.', priority: 'low' });
        }

        return recommendations;
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const overallScore = document.getElementById('overallScore');
        
        // Update overall score
        overallScore.textContent = results.overallScore;
        this.updateScoreCircle(results.overallScore);
        
        // Update category scores and details
        this.updateCategory('meta', results.categories.meta);
        this.updateCategory('content', results.categories.content);
        this.updateCategory('structure', results.categories.structure);
        this.updateCategory('technical', results.categories.technical);
        
        // Update recommendations
        this.updateRecommendations(results.recommendations);
        
        // Show limitations notice if present
        if (results.limitations) {
            this.showLimitationsNotice(results.limitations);
        }
        
        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    updateScoreCircle(score) {
        const scoreCircle = document.querySelector('.score-circle');
        const percentage = (score / 100) * 360;
        scoreCircle.style.background = `conic-gradient(var(--accent-primary) 0deg, var(--accent-primary) ${percentage}deg, #e5e7eb ${percentage}deg)`;
    }

    updateCategory(category, data) {
        const scoreElement = document.getElementById(`${category}Score`);
        const detailsElement = document.getElementById(`${category}Details`);
        
        // Update score
        scoreElement.textContent = data.score;
        scoreElement.className = `category-score ${this.getScoreClass(data.score)}`;
        
        // Update details
        detailsElement.innerHTML = '';
        Object.entries(data.details).forEach(([key, value]) => {
            const item = document.createElement('div');
            item.className = 'detail-item';
            item.innerHTML = `
                <span class="detail-label">${this.formatLabel(key)}</span>
                <div>
                    <span class="detail-value">${value.value}</span>
                    <span class="detail-status status-${value.status}">${value.status}</span>
                </div>
            `;
            detailsElement.appendChild(item);
        });
    }

    getScoreClass(score) {
        if (score >= 80) return 'score-excellent';
        if (score >= 70) return 'score-good';
        if (score >= 60) return 'score-fair';
        return 'score-poor';
    }

    formatLabel(key) {
        const labels = {
            title: 'Title Tag',
            description: 'Meta Description',
            keywords: 'Meta Keywords',
            ogTags: 'Open Graph Tags',
            headings: 'Heading Structure',
            keywords: 'Keyword Optimization',
            readability: 'Content Readability',
            length: 'Content Length',
            urls: 'URL Structure',
            navigation: 'Navigation',
            h1: 'H1 Heading',
            h2: 'H2 Headings',
            altTags: 'Image Alt Tags',
            https: 'HTTPS',
            urlLength: 'URL Length',
            structure: 'URL Structure',
            subdomain: 'Subdomain'
        };
        return labels[key] || key;
    }

    updateRecommendations(recommendations) {
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';
        
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
                <span class="recommendation-priority priority-${rec.priority}">${rec.priority.toUpperCase()} PRIORITY</span>
            `;
            recommendationsList.appendChild(item);
        });
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const startAnalysisBtn = document.getElementById('startAnalysis');
        
        loadingIndicator.style.display = show ? 'block' : 'none';
        startAnalysisBtn.disabled = show;
        startAnalysisBtn.textContent = show ? 'Analyzing...' : 'Start SEO Analysis';
    }

    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
    }

    clearResults() {
        document.getElementById('websiteUrl').value = '';
        this.hideResults();
        this.showNotification('Results cleared', 'success');
    }

    showLimitationsNotice(message) {
        // Create or update limitations notice
        let noticeElement = document.getElementById('limitationsNotice');
        if (!noticeElement) {
            noticeElement = document.createElement('div');
            noticeElement.id = 'limitationsNotice';
            noticeElement.className = 'limitations-notice';
            noticeElement.style.cssText = `
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 1rem 0;
                color: #856404;
                font-size: 0.875rem;
            `;
            
            // Insert before results section
            const resultsSection = document.getElementById('resultsSection');
            resultsSection.parentNode.insertBefore(noticeElement, resultsSection);
        }
        
        noticeElement.innerHTML = `
            <strong>⚠️ تحذير:</strong> ${message}
        `;
        noticeElement.style.display = 'block';
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system from main.js
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SEOAnalyzer();
});
