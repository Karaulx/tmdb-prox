(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Загрузка...'); // Лог инициализации

    // Ожидание готовности Lampa
    function init() {
        if (!window.lampa || !lampa.interceptor) {
            console.log('[TMDB Proxy] Ожидание инициализации Lampa...');
            setTimeout(init, 200);
            return;
        }

        const config = {
            proxyHost: 'https://novomih25.duckdns.org:9091',
            debug: true
        };

        // Перехватчик запросов
        lampa.interceptor.request.add({
            before: req => {
                // Проксируем API и изображения
                if (req.url.includes('themoviedb.org')) {
                    const newUrl = req.url
                        .replace('https://api.themoviedb.org/3', config.proxyHost + '/3')
                        .replace('https://image.tmdb.org', config.proxyHost)
                        .replace('http://image.tmdb.org', config.proxyHost);
                    
                    if (config.debug) console.log('[TMDB Proxy]', req.url, '→', newUrl);
                    return { ...req, url: newUrl };
                }
                return req;
            },
            error: err => {
                console.error('[TMDB Proxy] Ошибка:', err);
                return err;
            }
        });

        console.log('[TMDB Proxy] Успешно активирован');
    }

    // Старт при полной загрузке
    if (window.appready) init();
    else lampa.Listener.follow('app', e => e.type === 'ready' && init());

})();
