(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Адаптация для Lampa 2.4.6 (исправлено 500)');
    
    const CONFIG = {
        proxy: 'https://novomih25.duckdns.org:9092/3',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        }
    };

    const originalRequest = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (/themoviedb\.org/.test(url)) {
            const newUrl = url
                .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxy)
                .replace(/([?&])api_key=[^&]+&?/, '$1'); // Удаляем API-ключ из URL
            
            console.log('[TMDB Proxy] Перенаправление:', url, '→', newUrl);
            
            this.setRequestHeader('Authorization', 'Basic ' + btoa(
                CONFIG.credentials.username + ':' + CONFIG.credentials.password
            ));
            
            arguments[1] = newUrl;
        }
        return originalRequest.apply(this, arguments);
    };

    console.log('[TMDB Proxy] Плагин активирован!');
})();
