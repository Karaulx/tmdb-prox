(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск v3.1');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    function initProxy() {
        if (!window.lampa?.interceptor) {
            console.warn('[TMDB Proxy] Lampa.interceptor не доступен!');
            return false;
        }

        lampa.interceptor.request.add({
            before: req => {
                if (/themoviedb\.org/.test(req.url)) {
                    const newUrl = req.url
                        .replace('api.themoviedb.org', CONFIG.proxyHost)
                        .replace('image.tmdb.org', CONFIG.proxyHost);
                    
                    CONFIG.debug && console.log('[TMDB Proxy] Проксируем:', req.url);
                    
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
        return true;
    }

    // Улучшенный инициализатор
    function waitLampa(attempt = 0) {
        if (attempt > 30) {
            console.error('[TMDB Proxy] Lampa не найдена после 30 попыток');
            return;
        }

        if (initProxy()) return;
        
        setTimeout(() => {
            CONFIG.debug && console.log(`[TMDB Proxy] Проверка Lampa (${attempt + 1}/30)`);
            waitLampa(attempt + 1);
        }, 500);
    }

    // Альтернативные методы инициализации
    if (window.appready) {
        waitLampa();
    } else {
        const initMethods = [
            () => lampa.Listener?.follow('app', e => e.type === 'ready' && waitLampa()),
            () => document.addEventListener('lampa_state_ready', waitLampa)
        ];
        
        initMethods.forEach(method => {
            try { method() } catch (e) {}
        });
    }
})();
