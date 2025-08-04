(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск плагина...');
    
    // Конфигурация (ОБЯЗАТЕЛЬНО замените значения)
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'ваш_логин', // из /etc/nginx/.htpasswd
            password: 'ваш_пароль'
        },
        debug: true
    };

    // Генерация заголовка авторизации
    function getAuthHeader() {
        return 'Basic ' + btoa(config.credentials.username + ':' + config.credentials.password);
    }

    // Ожидание готовности Lampa
    function waitLampa() {
        if (!window.lampa || !lampa.interceptor) {
            if (config.debug) console.log('[TMDB Proxy] Ожидание инициализации Lampa...');
            setTimeout(waitLampa, 200);
            return;
        }
        
        // Перехватчик запросов
        lampa.interceptor.request.add({
            before: req => {
                if (req.url.includes('themoviedb.org')) {
                    const newUrl = req.url
                        .replace('https://api.themoviedb.org/3', config.proxyHost + '/3')
                        .replace(/https?:\/\/image\.tmdb\.org/, config.proxyHost);
                    
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
            },
            error: err => {
                console.error('[TMDB Proxy] Ошибка:', err);
                return err;
            }
        });
        
        console.log('[TMDB Proxy] Успешно активирован');
    }

    // Автозапуск
    if (window.appready) waitLampa();
    else lampa.Listener.follow('app', e => e.type === 'ready' && waitLampa());
})();
