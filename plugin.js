(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Адаптация для Lampa 2.4.6');
    
    const CONFIG = {
        proxy: 'https://novomih25.duckdns.org:9092/3',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        }
    };

    // Перехватчик для Lampa 2.x
    const originalRequest = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (/themoviedb\.org/.test(url)) {
            const newUrl = url
                .replace(/api\.themoviedb\.org\/3/, CONFIG.proxy)
                .replace(/image\.tmdb\.org/, CONFIG.proxy.replace('/3', ''));
            
            console.log('[TMDB Proxy] Перенаправление:', url, '→', newUrl);
            
            // Добавляем авторизацию
            this.setRequestHeader('Authorization', 'Basic ' + btoa(
                CONFIG.credentials.username + ':' + CONFIG.credentials.password
            ));
            
            arguments[1] = newUrl; // Подменяем URL
        }
        return originalRequest.apply(this, arguments);
    };

    console.log('[TMDB Proxy] Успешно подключен!');
})();
