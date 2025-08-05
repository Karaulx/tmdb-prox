(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v4.2');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    // Новый метод проверки Lampa с обработкой разных версий
    function initProxy() {
        try {
            // Для Lampa 3.x
            if (window.lampa?.interceptor?.request?.add) {
                lampa.interceptor.request.add({
                    before: req => processRequest(req)
                });
                console.log('[TMDB Proxy] Успешно подключен (Lampa 3.x)');
                return true;
            }
            // Для Lampa 4.x
            else if (window.lampa?.request?.addInterceptor) {
                lampa.request.addInterceptor({
                    request: req => processRequest(req)
                });
                console.log('[TMDB Proxy] Успешно подключен (Lampa 4.x)');
                return true;
            }
            return false;
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка инициализации:', e);
            return false;
        }
    }

    function processRequest(req) {
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
    }

    // Улучшенный инициализатор
    function waitForLampa(attempt = 0) {
        if (initProxy()) return;
        
        if (attempt >= 50) {
            console.error('[TMDB Proxy] Lampa не найдена после 50 попыток');
            
            // Попытка вручную найти Lampa в глобальном объекте
            if (window.app?.lampa) {
                console.log('[TMDB Proxy] Обнаружен альтернативный путь к Lampa');
                window.lampa = window.app.lampa;
                initProxy();
            }
            return;
        }
        
        setTimeout(() => {
            CONFIG.debug && console.log(`[TMDB Proxy] Проверка (${attempt + 1}/50)`);
            waitForLampa(attempt + 1);
        }, 300);
    }

    // Все методы инициализации
    const initMethods = [
        () => window.appready && waitForLampa(),
        () => document.addEventListener('DOMContentLoaded', waitForLampa),
        () => window.addEventListener('load', waitForLampa),
        () => setTimeout(waitForLampa, 1500)
    ];

    // Запуск
    initMethods.forEach(method => {
        try { method(); } catch (e) { console.error(e); }
    });
})();
