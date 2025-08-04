(function() {
    'use strict';

    if (!window.lampa) return;

    // Конфигурация с учетными данными
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        auth: {
            username: 'jackett', // Замените на реальные данные
            password: '3p4uh49y'  // из /etc/nginx/.htpasswd
        },
        debug: true
    };

    // Генерация Basic Auth заголовка
    function getAuthHeader() {
        return 'Basic ' + btoa(config.auth.username + ':' + config.auth.password);
    }

    // Проксирование URL
    function proxyUrl(url) {
        if (!url) return url;
        return url
            .replace('https://api.themoviedb.org/3', config.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, config.proxyHost);
    }

    // Инициализация
    function init() {
        if (!lampa.interceptor) {
            setTimeout(init, 100);
            return;
        }

        // Перехватчик запросов
        lampa.interceptor.request.add({
            before: req => {
                const newUrl = proxyUrl(req.url);
                if (newUrl !== req.url) {
                    if (config.debug) console.log('[TMDB Proxy]', req.url, '→', newUrl);
                    return {
                        ...req,
                        url: newUrl,
                        headers: {
                            ...req.headers,
                            'Authorization': getAuthHeader()
                        }
                    };
                }
                return req;
            }
        });

        console.log('[TMDB Proxy] Готов к работе с аутентификацией');
    }

    // Автозапуск
    if (window.appready) init();
    else lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
