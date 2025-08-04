(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация...');
    
    // Конфигурация (ЗАМЕНИТЕ значения)
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        auth: {
            username: 'ваш_логин', // из /etc/nginx/.htpasswd
            password: 'ваш_пароль'
        },
        debug: true
    };

    // Проверка готовности Lampa
    function init() {
        if (!window.lampa || !lampa.interceptor) {
            if (config.debug) console.log('[TMDB Proxy] Ожидание инициализации Lampa...');
            setTimeout(init, 100);
            return;
        }

        // Перехватчик запросов
        lampa.interceptor.request.add({
            before: req => {
                if (/themoviedb\.org/.test(req.url)) {
                    const newUrl = req.url
                        .replace('https://api.themoviedb.org/3', config.proxyHost + '/3')
                        .replace(/https?:\/\/image\.tmdb\.org/, config.proxyHost);
                    
                    if (config.debug) console.log('[TMDB Proxy]', req.url, '→', newUrl);
                    
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
            },
            error: err => {
                console.error('[TMDB Proxy] Ошибка:', err);
                return err;
            }
        });
        
        console.log('[TMDB Proxy] Успешно активирован');
    }

    // Автозапуск
    if (window.appready) init();
    else lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
