(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация...');
    
    // Конфигурация (замените на свои данные)
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        auth: {
            username: 'jackett', // из /etc/nginx/.htpasswd
            password: '3p4uh49y'
        },
        debug: true
    };

    // Проверка готовности Lampa
    function init() {
        if (!window.lampa || !lampa.interceptor) {
            setTimeout(init, 100);
            return;
        }

        // Перехватчик запросов
        lampa.interceptor.request.add({
            before: req => {
                if (/themoviedb\.org/.test(req.url)) {
                    const newUrl = req.url
                        .replace('api.themoviedb.org', config.proxyHost)
                        .replace('image.tmdb.org', config.proxyHost);
                    
                    if (config.debug) console.log('Проксирование:', req.url, '→', newUrl);
                    
                    return {
                        ...req,
                        url: newUrl,
                        headers: {
                            ...req.headers,
                            'Authorization': 'Basic ' + btoa(config.auth.username + ':' + config.auth.password)
                        }
                    };
                }
                return req;
            }
        });
        
        console.log('[TMDB Proxy] Успешно активирован');
    }

    // Автозапуск
    if (window.appready) init();
    else lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
