(function() {
    'use strict';

    if (!window.lampa) return;

    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        debug: true,
        version: '1.0'
    };

    // Перехватчик API запросов
    if (lampa.interceptor) {
        lampa.interceptor.request.add({
            before: req => {
                if (req.url.includes('api.themoviedb.org/3')) {
                    const newUrl = req.url.replace(
                        'https://api.themoviedb.org/3',
                        config.proxyHost + '/3'
                    );
                    if (config.debug) console.log('[TMDB Proxy] API:', req.url, '→', newUrl);
                    return { ...req, url: newUrl };
                }
                return req;
            }
        });
    }

    // Перехватчик изображений
    const originalImageGet = lampa.utils.image.get;
    lampa.utils.image.get = function(url, ...args) {
        if (url && url.includes('image.tmdb.org')) {
            url = url.replace(
                'https://image.tmdb.org',
                config.proxyHost
            );
            if (config.debug) console.log('[TMDB Proxy] Image:', url);
        }
        return originalImageGet.call(this, url, ...args);
    };

    console.log(`TMDB Proxy v${config.version} initialized`);
})();
