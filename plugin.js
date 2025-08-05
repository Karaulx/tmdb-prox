(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация...');
    
    // Конфигурация
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        debug: true
    };

    // Главная функция проксирования
    function proxyRequest(url) {
        if (!url) return url;
        return url
            .replace('https://api.themoviedb.org/3', config.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, config.proxyHost);
    }

    // Ожидание готовности Lampa
    function init() {
        if (!window.lampa || !lampa.interceptor) {
            setTimeout(init, 100);
            return;
        }

        // Перехват API запросов
        lampa.interceptor.request.add({
            before: req => {
                const newUrl = proxyRequest(req.url);
                if (newUrl !== req.url && config.debug) {
                    console.log('[TMDB Proxy]', req.url, '→', newUrl);
                }
                return { ...req, url: newUrl };
            }
        });

        console.log('[TMDB Proxy] Готов к работе');
    }

    // Автозапуск
    if (window.appready) init();
    else lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
