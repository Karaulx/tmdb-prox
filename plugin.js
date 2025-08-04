(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск v4.0');
    
    const CONFIG = {
        proxyHost: '',
        credentials: {
            username: '',
            password: ''
        },
        debug: true
    };

    function isLampaReady() {
        return window.lampa?.interceptor?.request?.add instanceof Function;
    }

    function activateProxy() {
        try {
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        const newUrl = req.url
                            .replace(/(https?:)?\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                            .replace(/(https?:)?\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                        
                        CONFIG.debug && console.log('[TMDB Proxy] Проксирование:', req.url);
                        
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
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка активации:', e);
            return false;
        }
    }

    function waitForLampa(attempt = 0) {
        if (isLampaReady()) {
            return activateProxy();
        }

        if (attempt >= 50) {
            console.error('[TMDB Proxy] Lampa не загрузилась после 50 попыток');
            return false;
        }

        setTimeout(() => {
            CONFIG.debug && console.log(`[TMDB Proxy] Проверка готовности (${attempt + 1}/50)`);
            waitForLampa(attempt + 1);
        }, 300);
    }

    // Все возможные методы инициализации
    const initMethods = [
        () => window.appready && waitForLampa(),
        () => window.lampa?.Listener?.follow('app', e => e.type === 'ready' && waitForLampa()),
        () => document.addEventListener('DOMContentLoaded', waitForLampa),
        () => window.addEventListener('load', waitForLampa),
        () => setTimeout(waitForLampa, 1000)
    ];

    // Запуск всех методов инициализации
    initMethods.forEach(method => {
        try { method(); } catch (e) { console.error(e); }
    });
})();
