(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск Ultimate Edition');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        }
    };

    // 1. Попытка найти Lampa в нестандартных местах
    function findLampa() {
        return window.lampa || 
               window.app?.lampa || 
               window.parent?.lampa ||
               Object.values(window).find(v => v?.interceptor);
    }

    // 2. Альтернативный метод перехвата
    function hijackFetch() {
        const originalFetch = window.fetch;
        window.fetch = async function(url, options) {
            if (/themoviedb\.org/.test(url)) {
                const newUrl = url
                    .replace(/api\.themoviedb\.org/, CONFIG.proxyHost)
                    .replace(/image\.tmdb\.org/, CONFIG.proxyHost);
                
                options = options || {};
                options.headers = new Headers(options.headers);
                options.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                
                console.log('[TMDB Proxy] Перехвачен запрос:', url);
                return originalFetch(newUrl, options);
            }
            return originalFetch(url, options);
        };
        console.log('[TMDB Proxy] Активирован перехват fetch!');
    }

    // 3. Основная инициализация
    function init() {
        const lampa = findLampa();
        
        if (lampa?.interceptor) {
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        req.url = req.url
                            .replace(/api\.themoviedb\.org/, CONFIG.proxyHost)
                            .replace(/image\.tmdb\.org/, CONFIG.proxyHost);
                        req.headers.set('Authorization', 
                            'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                        console.log('[TMDB Proxy] Прокси через Lampa:', req.url);
                    }
                    return req;
                }
            });
            console.log('[TMDB Proxy] Успешно подключен к Lampa API!');
        } else {
            hijackFetch();
        }
    }

    // Запуск с прогрессивной задержкой
    let attempts = 0;
    const tryInit = () => {
        attempts++;
        if (attempts <= 100) {
            setTimeout(() => {
                if (document.readyState === 'complete') {
                    init();
                } else {
                    tryInit();
                }
            }, attempts < 50 ? 300 : 1000);
        }
    };
    
    document.addEventListener('DOMContentLoaded', tryInit);
    if (document.readyState === 'complete') tryInit();
})();
