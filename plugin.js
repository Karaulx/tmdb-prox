(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск v4.3');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    // 1. Проверка доступности прокси
    function checkProxy() {
        return fetch(`${CONFIG.proxyHost}/3/movie/550`, {
            headers: {
                'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
            }
        })
        .then(r => r.ok)
        .catch(() => false);
    }

    // 2. Универсальный перехватчик
    function setupProxy() {
        // Для Lampa 3.x/4.x
        if (window.lampa?.interceptor?.request?.add) {
            lampa.interceptor.request.add({
                before: req => processRequest(req),
                error: err => {
                    console.error('[TMDB Proxy] Ошибка:', err);
                    return err;
                }
            });
            return true;
        }
        
        // Для других версий
        hijackNativeRequests();
        return false;
    }

    function hijackNativeRequests() {
        // Перехват XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url) {
                if (/themoviedb\.org/.test(url)) {
                    url = rewriteUrl(url);
                    arguments[1] = url;
                    xhr.setRequestHeader('Authorization', 
                        'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                }
                return originalOpen.apply(xhr, arguments);
            };
            return xhr;
        };

        // Перехват fetch
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            if (typeof input === 'string' && /themoviedb\.org/.test(input)) {
                input = rewriteUrl(input);
                init = init || {};
                init.headers = new Headers(init.headers);
                init.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
            }
            return originalFetch(input, init);
        };

        console.log('[TMDB Proxy] Активирован низкоуровневый перехват!');
    }

    function rewriteUrl(url) {
        return url
            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
    }

    // 3. Инициализация
    async function init() {
        const proxyAvailable = await checkProxy();
        if (!proxyAvailable) {
            console.error('[TMDB Proxy] Прокси недоступен! Проверьте настройки.');
            return;
        }

        if (!setupProxy()) {
            console.log('[TMDB Proxy] Используется альтернативный перехват');
        }
        
        console.log('[TMDB Proxy] Готово! Все запросы перенаправляются.');
    }

    // Запускаем после полной загрузки
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
        document.addEventListener('DOMContentLoaded', init);
    }
})();
