// Vercel Analytics for web projects
// This script initializes Vercel Analytics for tracking page views and events

(function() {
    // Check if analytics is already loaded
    if (window.va) return;

    // Create analytics function queue
    window.va = function() {
        (window.vaq = window.vaq || []).push(arguments);
    };

    // Load the Vercel Analytics script
    var script = document.createElement('script');
    script.src = 'https://va.vercel-scripts.com/v1/script.debug.js';
    script.defer = true;
    // Note: The website-id will be auto-detected when deployed on Vercel
    document.head.appendChild(script);

    // Track initial page view
    window.va('pageview');

    console.log('Vercel Analytics initialized');
})();

// Helper function to track custom events
window.trackEvent = function(eventName, properties = {}) {
    if (window.va) {
        window.va('event', eventName, properties);
        console.log('Event tracked:', eventName, properties);
    } else {
        console.log('Analytics not ready, queuing event:', eventName, properties);
        // Queue the event for when analytics is ready
        setTimeout(() => window.trackEvent(eventName, properties), 1000);
    }
};

// Track tool usage with enhanced data
window.trackToolUsage = function(toolName, action = 'click') {
    const properties = {
        tool_name: toolName,
        action: action,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent.substring(0, 100), // Limited to avoid data limits
        language: document.documentElement.lang || 'en'
    };
    
    window.trackEvent('tool_usage', properties);
};

// Track search queries with enhanced data
window.trackSearch = function(query, resultsCount = 0) {
    const properties = {
        query: query.substring(0, 100), // Limit query length
        results_count: resultsCount,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        language: document.documentElement.lang || 'en'
    };
    
    window.trackEvent('search', properties);
};

// Track button clicks with enhanced context
window.trackButtonClick = function(buttonName, location = 'unknown') {
    const properties = {
        button_name: buttonName,
        location: location,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        language: document.documentElement.lang || 'en'
    };
    
    window.trackEvent('button_click', properties);
};

// Track page engagement
window.trackPageEngagement = function(timeOnPage) {
    const properties = {
        time_on_page: Math.round(timeOnPage / 1000), // Convert to seconds
        page_url: window.location.href,
        timestamp: new Date().toISOString()
    };
    
    window.trackEvent('page_engagement', properties);
};

// Track errors
window.trackError = function(errorMessage, errorSource = 'unknown') {
    const properties = {
        error_message: errorMessage.substring(0, 200), // Limit error message length
        error_source: errorSource,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
    };
    
    window.trackEvent('error', properties);
};

// Auto-track page engagement time
(function() {
    let pageStartTime = Date.now();
    
    // Track time on page when user leaves
    window.addEventListener('beforeunload', function() {
        const timeOnPage = Date.now() - pageStartTime;
        if (timeOnPage > 5000) { // Only track if user stayed more than 5 seconds
            window.trackPageEngagement(timeOnPage);
        }
    });
    
    // Track time on page when page becomes hidden (mobile/tab switching)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            const timeOnPage = Date.now() - pageStartTime;
            if (timeOnPage > 5000) {
                window.trackPageEngagement(timeOnPage);
            }
        } else {
            pageStartTime = Date.now(); // Reset timer when page becomes visible again
        }
    });
})();

// Auto-track JavaScript errors
window.addEventListener('error', function(event) {
    window.trackError(event.message, event.filename);
});

window.addEventListener('unhandledrejection', function(event) {
    window.trackError('Unhandled Promise Rejection: ' + event.reason, 'promise');
});