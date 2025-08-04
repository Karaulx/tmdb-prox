(function() {
    'use strict';

    if (!window.lampa) return;

    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        debug: true
    };

    // Функция для проксирования URL
    function proxyUrl(url) {
        if (!url || typeof url !== 'string') return url;
        
        return url.replace(
            /^https?:\/\/(image\.tmdb\.org|api\.themoviedb\.org\/3)/, 
            config.proxyHost
        );
    }

    // Перехватчик API запросов
    if (lampa.interceptor) {
        lampa.interceptor.request.add({
            before: req => {
                if (req.url.includes('api.themoviedb.org/3')) {
                    const newUrl = proxyUrl(req.url);
                    if (config.debug) console.log('[TMDB Proxy] API:', req.url, '→', newUrl);
                    return { ...req, url: newUrl };
                }
                return req;
            }
        });
    }

    // Переопределяем все методы работы с изображениями
    const imageHandlers = ['image', 'background', 'poster', 'cover'];
    imageHandlers.forEach(handler => {
        if (lampa.utils[handler]?.get) {
            const originalGet = lampa.utils[handler].get;
            lampa.utils[handler].get = function(url, ...args) {
                return originalGet.call(this, proxyUrl(url), ...args);
            };
        }
    });

    // Перехватываем создание DOM элементов с изображениями
    const originalCreate = Element.prototype.createElement;
    Element.prototype.createElement = function(tagName, options) {
        const element = originalCreate.call(this, tagName, options);
        if (tagName === 'img' && element.src.includes('image.tmdb.org')) {
            element.src = proxyUrl(element.src);
        }
        return element;
    };

    console.log('TMDB Proxy initialized');
})();
