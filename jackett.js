(function() {
    'use strict';
    
    // ================= CORS FIXER =================
    const fixUrl = url => url.replace(/([^:]\/)\/+/g, '$1');
    
    // Сохраняем оригинальные методы
    window._originalFetch = window.fetch;
    window._originalXHROpen = XMLHttpRequest.prototype.open;
    
    // Перехватчик fetch
    window.fetch = async function(input, init) {
        try {
            input = typeof input === 'string' ? fixUrl(input) : input;
            return await window._originalFetch(input, {
                ...init,
                mode: 'no-cors',
                headers: {
                    ...(init?.headers || {}),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        } catch (error) {
            console.error('[Fetch Error]', error);
            throw error;
        }
    };
    
    // Перехватчик XMLHttpRequest
    XMLHttpRequest.prototype.open = function() {
        if (arguments[1]) {
            arguments[1] = fixUrl(arguments[1]);
        }
        this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        return window._originalXHROpen.apply(this, arguments);
    };
    
    // ================= JACKETT INTEGRATION =================
    const JACKETT_CONFIG = {
        server: 'http://novomih25.duckdns.org',
        apiKey: '4ua9hdxh6mn6oxuim9qgwzlcw0g8btbk',
        timeout: 10000
    };
    
    Lampa.Jackett = {
        search: function(params) {
            const url = new URL(`${JACKETT_CONFIG.server}/api/v2.0/indexers/all/results`);
            
            // Базовые параметры
            url.searchParams.append('apikey', JACKETT_CONFIG.apiKey);
            
            // Добавляем пользовательские параметры
            Object.keys(params).forEach(key => {
                if (Array.isArray(params[key])) {
                    params[key].forEach(val => url.searchParams.append(`${key}[]`, val));
                } else {
                    url.searchParams.append(key, params[key]);
                }
            });
            
            return fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }).then(r => r.json());
        }
    };
    
    // Автоматическая интеграция с Lampa
    if (Lampa.Storage) {
        Lampa.Storage.set('jackett_server', JACKETT_CONFIG.server);
        Lampa.Storage.set('jackett_apikey', JACKETT_CONFIG.apiKey);
    }
    
    console.log('[Lampa Mod] Jackett+CORS fixer activated');
})();
