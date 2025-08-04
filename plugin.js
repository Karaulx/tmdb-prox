(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск финальной версии');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    function activateProxy() {
        try {
            const interceptor = window.lampa.interceptor;
            
            interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        const newUrl = req.url
                            .replace(/(https?:)?\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                            .replace(/(https?:)?\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                        
                        CONFIG.debug && console.log('[TMDB Proxy] Проксирование:', req.url.substring(0, 50) + '...');
                        
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
            
            console.log('[TMDB Proxy] Успешно подключен к Lampa!');
            return true;
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка активации:', e);
            return false;
        }
    }

    function waitForLampa(attempt = 0) {
        if (window.lampa?.interceptor) {
            return activateProxy();
        }
        
        if (attempt > 30) {
            console.error('[TMDB Proxy] Lampa не обнаружена после 30 попыток');
            return false;
        }
        
        setTimeout(() => {
            CONFIG.debug && console.log(`[TMDB Proxy] Ожидание Lampa (${attempt + 1}/30)`);
            waitForLampa(attempt + 1);
        }, 300);
    }

    // Основной запуск
    if (document.readyState === 'complete') {
        waitForLampa();
    } else {
        window.addEventListener('load', () => waitForLampa());
        document.addEventListener('DOMContentLoaded', () => waitForLampa());
    }
})();
