(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v4.1');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    // Новый метод проверки Lampa
    function waitForLampa(callback, attempts = 0) {
        if (window.lampa && window.lampa.interceptor) {
            console.log('[TMDB Proxy] Lampa найдена!');
            callback();
        } else if (attempts < 50) {
            setTimeout(() => {
                console.log(`[TMDB Proxy] Ожидание Lampa (${attempts + 1}/50)`);
                waitForLampa(callback, attempts + 1);
            }, 300);
        } else {
            console.error('[TMDB Proxy] Lampa не загрузилась!');
        }
    }

    // Инициализация прокси
    function initProxy() {
        try {
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        const newUrl = req.url
                            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                        
                        console.log('[TMDB Proxy] Проксирование:', req.url);
                        
                        return {
                            ...req,
                            url: newUrl,
                            headers: {
                                ...req.headers,
                                'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                            }
                        };
                    }
                    return req;
                }
            });
            console.log('[TMDB Proxy] Успешно активирован!');
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка:', e);
        }
    }

    // Запуск
    if (window.appready) {
        initProxy();
    } else {
        document.addEventListener('DOMContentLoaded', () => waitForLampa(initProxy));
        window.addEventListener('load', () => waitForLampa(initProxy));
    }
})();
