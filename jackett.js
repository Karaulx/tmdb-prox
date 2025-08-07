(function() {
    'use strict';
    
    const fixUrl = url => url.replace(/([^:]\/)\/+/g, '$1');

    // 1. Перехват fetch с обработкой ошибок
    const _originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        try {
            input = typeof input === 'string' ? fixUrl(input) : input;
            
            const response = await _originalFetch.call(this, input, {
                ...init,
                mode: 'no-cors',
                headers: {
                    ...(init?.headers || {}),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Network error');
            return response;
            
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    // 2. Перехват XMLHttpRequest
    if (window.XMLHttpRequest) {
        const _originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function() {
            arguments[1] = fixUrl(arguments[1]);
            this.addEventListener('error', () => console.error('XHR error'));
            return _originalOpen.apply(this, arguments);
        };
    }

    console.log('[Network Fixer] Activated');
})();
