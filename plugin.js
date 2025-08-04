(function() {
    'use strict';

    if (!window.lampa) return;

    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        debug: true
    };

    // Перехватчик для API TMDB
    if (lampa.interceptor) {
        lampa.interceptor.request.add({
            before: req => {
                if (req.url.includes('api.themoviedb.org/3')) {
                    req.url = req.url.replace(
                        'https://api.themoviedb.org/3',
                        config.proxyHost + '/3'
                    );
                    if (config.debug) console.log('[TMDB Proxy] API:', req.url);
                }
                return req;
            }
        });
    }

    // Перехватчик изображений (исправленная версия)
    const originalImageGet = lampa.utils.image.get;
    lampa.utils.image.get = function(url, ...args) {
        if (url && typeof url === 'string' && url.includes('image.tmdb.org')) {
            const proxiedUrl = url.replace(
                'http://image.tmdb.org',
                config.proxyHost
            ).replace(
                'https://image.tmdb.org',
                config.proxyHost
            );
            if (config.debug) console.log('[TMDB Proxy] Image:', url, '→', proxiedUrl);
            return originalImageGet.call(this, proxiedUrl, ...args);
        }
        return originalImageGet.call(this, url, ...args);
    };

    // Перехватчик для background изображений
    const originalBackground = lampa.utils.background.get;
    lampa.utils.background.get = function(url, ...args) {
        if (url && typeof url === 'string' && url.includes('image.tmdb.org')) {
            const proxiedUrl = url.replace(
                /^https?:\/\/image\.tmdb\.org/,
                config.proxyHost
            );
            if (config.debug) console.log('[TMDB Proxy] Background:', proxiedUrl);
            return originalBackground.call(this, proxiedUrl, ...args);
        }
        return originalBackground.call(this, url, ...args);
    };

    console.log('TMDB Proxy initialized');
})();
