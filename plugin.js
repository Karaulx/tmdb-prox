(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск v2.1');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'ваш_логин',
            password: 'ваш_пароль'
        },
        debug: true
    };

    function log(message) {
        if (CONFIG.debug) console.log(`[TMDB Proxy] ${message}`);
    }

    function init() {
        if (!window.lampa) {
            log('Lampa не обнаружена');
            return false;
        }

        if (!lampa.interceptor) {
            log('Interceptor не доступен');
            return false;
        }

        const authHeader = 'Basic ' + btoa(
            CONFIG.credentials.username + ':' + CONFIG.credentials.password
        );

        lampa.interceptor.request.add({
            before: request => {
                if (request.url.includes('themoviedb.org')) {
                    const proxiedUrl = request.url
                        .replace('api.themoviedb.org', CONFIG.proxyHost)
                        .replace('image.tmdb.org', CONFIG.proxyHost);
                    
                    log(`Проксирование: ${request.url} → ${proxiedUrl}`);
                    
                    return {
                        ...request,
                        url: proxiedUrl,
                        headers: {
                            ...request.headers,
                            'Authorization': authHeader
                        }
                    };
                }
                return request;
            },
            error: error => {
                console.error('[TMDB Proxy] Ошибка:', error);
                return error;
            }
        });

        log('Успешно активирован!');
        return true;
    }

    function waitLampa(retry = 0) {
        if (retry > 20) {
            console.error('[TMDB Proxy] Превышено количество попыток');
            return;
        }

        if (init()) return;
        
        setTimeout(() => {
            log(`Повторная проверка (${retry + 1}/20)`);
            waitLampa(retry + 1);
        }, 500);
    }

    // Автозапуск
    if (window.appready) waitLampa();
    else {
        document.addEventListener('DOMContentLoaded', waitLampa);
        if (window.lampa?.Listener) {
            lampa.Listener.follow('app', e => e.type === 'ready' && waitLampa());
        }
    }
})();
