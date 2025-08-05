(function() {
    'use strict';
    // Вставьте в начало плагина (после 'use strict')
const replaceImageUrls = (url) => {
    return url.replace(/https?:\/\/image\.tmdb\.org/, 'https://novomih25.duckdns.org:9092');
};

// Перехватчик для изображений
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    if (tagName.toLowerCase() === 'img') {
        const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        Object.defineProperty(element, 'src', {
            get: function() { return originalSrc.get.call(this); },
            set: function(value) {
                if (/image\.tmdb\.org/.test(value)) {
                    const newUrl = replaceImageUrls(value);
                    console.log('[TMDB Proxy] Замена изображения:', value, '→', newUrl);
                    originalSrc.set.call(this, newUrl);
                } else {
                    originalSrc.set.call(this, value);
                }
            }
        });
    }
    return element;
};
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
