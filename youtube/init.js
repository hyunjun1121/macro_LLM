// Initialization script to ensure everything works properly
(function() {
    'use strict';
    
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
    });
    
    // Ensure all functions are available globally
    function ensureGlobals() {
        // Check if all required globals are available
        const requiredGlobals = ['mockData', 'router', 'renderer'];
        const missing = requiredGlobals.filter(name => typeof window[name] === 'undefined');
        
        if (missing.length > 0) {
            console.warn('Missing globals:', missing);
            return false;
        }
        
        return true;
    }
    
    // Initialize when DOM is ready
    function init() {
        console.log('Initializing YouTube Clone...');
        
        // Add loading class to body
        document.body.classList.add('loading');
        
        // Wait for all scripts to be ready
        const checkReady = setInterval(() => {
            if (ensureGlobals()) {
                clearInterval(checkReady);
                
                // Remove loading class
                document.body.classList.remove('loading');
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('youtube-clone-ready'));
                
                console.log('YouTube Clone fully initialized!');
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkReady);
            document.body.classList.remove('loading');
            console.warn('YouTube Clone initialization timed out');
        }, 5000);
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Utility functions
    window.youtubeUtils = {
        formatNumber: function(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(0) + 'K';
            }
            return num.toString();
        },
        
        formatDuration: function(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return mins + ':' + String(secs).padStart(2, '0');
        },
        
        timeAgo: function(dateString) {
            const now = new Date();
            const date = new Date(dateString);
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return '1 day ago';
            if (diffDays < 7) return diffDays + ' days ago';
            if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
            if (diffDays < 365) return Math.floor(diffDays / 30) + ' months ago';
            return Math.floor(diffDays / 365) + ' years ago';
        },
        
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };
    
    // Performance monitoring
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        }, 0);
    });
    
})();