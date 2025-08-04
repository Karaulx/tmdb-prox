(function() {
    'use strict';

    if (!window.lampa || !lampa.interceptor) {
        console.error('Lampa API not found');
        return;
    }

    const config = {
        debug: true,
        proxyUrl: 'https://novomih25.duckdns.org:9091', // Ваш прокси-сервер
        apiKey: 'a68d078b1475b51c18e6d4d0f44600f8', // Ваш TMDB API ключ
        auth: {
            username: 'jackatt', // Замените на реальные данные
            password: '3p4uh49y'  // из /etc/nginx/.htpasswd
        }
    };

    function log(...args) {
        if (config.debug) console.log('[TMDB Proxy]', ...args);
    }

    function base64Auth() {
        return btoa(`${config.auth.username}:${config.auth.password}`);
    }

    // Перехватчик запросов
    lampa.interceptor.request.add({
        before: function(req) {
            if (req.url.includes('api.themoviedb.org/3')) {
                try {
                    const newUrl = req.url.replace(
                        'https://api.themoviedb.org/3',
                        config.proxyUrl + '/3'
                    );

                    log('Proxying request:', req.url, '->', newUrl);

                    return {
                        ...req,
                        url: newUrl,
                        headers: {
                            ...req.headers,
                            'Authorization': `Basic ${base64Auth()}`,
                            'X-Proxy-Source': 'Lampa-TMDB-Proxy'
                        }
                    };
                } catch (e) {
                    log('Interceptor error:', e);
                }
            }
            return req;
        },
        after: function(res) {
            if (res.url.includes(config.proxyUrl)) {
                log('Proxied response:', res.status, res.url);
            }
            return res;
        },
        error: function(err) {
            log('Request failed:', err);
            return err;
        }
    });

    // Добавляем настройки в интерфейс Lampa
    if (lampa.SettingsApi) {
        lampa.SettingsApi.addParam({
            component: 'network',
            param: {
                name: 'tmdb_proxy_active',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Активировать TMDB Proxy',
                description: 'Перенаправляет запросы через ваш прокси-сервер'
            }
        });
    }

    console.log('TMDB Proxy plugin initialized');
})();
