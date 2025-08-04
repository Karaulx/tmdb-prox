(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск v3.2');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true,
        maxRetries: 50
    };

    function initProxy() {
        try {
            if (window.lampa && lampa.interceptor) {
                lampa.interceptor.request.add({
                    before: req => {
                        if (/themoviedb\.org/.test(req.url)) {
                            const newUrl = req.url
                                .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                                .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                            
                            CONFIG.debug && console.log('[TMDB Proxy] Проксирование:', req.url, '→', newUrl);
                            
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
                    },
                    error: err => {
                        console.error('[TMDB Proxy] Ошибка:', err);
                        return err;
                    }
                });
                console.log('[TMDB Proxy] Успешно активирован!');
                return true;
            }
            return false;
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка инициализации:', e);
            return false;
        }
    }

    function waitLampa(attempt = 0) {
        if (initProxy()) return;
        
        if (attempt >= CONFIG.maxRetries) {
            console.error(`[TMDB Proxy] Lampa не найдена после ${CONFIG.maxRetries} попыток`);
            return;
        }
        
        setTimeout(() => {
            CONFIG.debug && console.log(`[TMDB Proxy] Проверка (${attempt + 1}/${CONFIG.maxRetries})`);
            waitLampa(attempt + 1);
        }, 300);
    }

    // Все возможные методы инициализации
    const initMethods = [
        () => window.appready && waitLampa(),
        () => window.lampa?.Listener?.follow('app', e => e.type === 'ready' && waitLampa()),
        () => document.addEventListener('DOMContentLoaded', waitLampa),
        () => window.addEventListener('load', waitLampa),
        () => setTimeout(waitLampa, 1000) // Финальная попытка
    ];

    initMethods.forEach(method => {
        try { method(); } catch (e) { console.error(e); }
    });
})();
