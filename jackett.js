// cors-fixer.js
(function() {
    'use strict';
    
    const fixUrl = url => url.replace(/([^:]\/)\/+/g, '$1');

    // Сохраняем оригинальные методы
    window._originalFetch = window.fetch;
    window._originalXHROpen = XMLHttpRequest.prototype.open;
    
    // Fetch interceptor
    window.fetch = async function(input, init) {
        try {
            input = typeof input === 'string' ? fixUrl(input) : input;
            const response = await window._originalFetch(input, {
                ...init,
                mode: 'no-cors'
            });
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    // XMLHttpRequest interceptor
    XMLHttpRequest.prototype.open = function() {
        arguments[1] = fixUrl(arguments[1]);
        return window._originalXHROpen.apply(this, arguments);
    };

    console.log('[CORS Fixer] Activated');
})();
