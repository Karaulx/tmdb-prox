(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v12.1');
    
    const CONFIG = {
        // Основные прокси-серверы
        proxies: [
            'https://novomih25.duckdns.org:9092',
            'https://tmdb-proxy-alternate.example.com'
        ],
        // Резервные серверы
        fallbacks: [
            'https://api.themoviedb.org/3',
            'https://tmdb-proxy-backup.example.com'
        ],
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        timeout: 5000 // 5 секунд на проверку
    };

    // 1. Проверка доступности сервера
    async function testConnection(url) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            const response = await fetch(`${url}/movie/550`, {
                signal: controller.signal,
                headers: {
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                }
            });
            
            clearTimeout(timeout);
            return response.ok;
        } catch (e) {
            console.log(`[TMDB Proxy] Тест ${url}:`, e.message);
            return false;
        }
    }

    // 2. Выбор рабочего соединения
    async function selectConnection() {
        // Проверка основных прокси
        for (const proxy of CONFIG.proxies) {
            if (await testConnection(proxy)) {
                console.log(`[TMDB Proxy] Используется прокси: ${proxy}`);
                return proxy;
            }
        }
        
        // Проверка резервных
        for (const fallback of CONFIG.fallbacks) {
            if (await testConnection(fallback)) {
                console.warn(`[TMDB Proxy] Используется резерв: ${fallback}`);
                return fallback;
            }
        }
        
        throw new Error('Нет доступных соединений');
    }

    // 3. Инициализация перехватчика
    async function initProxy() {
        try {
            const activeProxy = await selectConnection();
            
            // Для Lampa 3.x/4.x
            if (window.lampa?.interceptor?.request?.add) {
                lampa.interceptor.request.add({
                    before: req => {
                        if (/themoviedb\.org/.test(req.url)) {
                            req.url = req.url
                                .replace(/api\.themoviedb\.org\/3/, activeProxy + '/3')
                                .replace(/image\.tmdb\.org/, activeProxy);
                            req.headers.set('Authorization', 
                                'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                        }
                        return req;
                    }
                });
                console.log('[TMDB Proxy] Успешно подключен к Lampa API');
            } else {
                console.warn('[TMDB Proxy] Lampa API не найден, используется низкоуровневый перехват');
                setupGlobalProxy(activeProxy);
            }
            
        } catch (e) {
            console.error('[TMDB Proxy] Критическая ошибка:', e);
        }
    }

    // 4. Глобальный перехват (если Lampa не обнаружена)
    function setupGlobalProxy(proxyUrl) {
        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            if (typeof input === 'string' && /themoviedb\.org/.test(input)) {
                input = input
                    .replace(/api\.themoviedb\.org\/3/, proxyUrl + '/3')
                    .replace(/image\.tmdb\.org/, proxyUrl);
                
                init = init || {};
                init.headers = new Headers(init.headers);
                init.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
            }
            return originalFetch(input, init);
        };
    }

    // Запуск с защитой от таймаутов
    function safeInit() {
        const initTimeout = setTimeout(() => {
            console.warn('[TMDB Proxy] Таймаут инициализации, повторная попытка...');
            safeInit();
        }, 15000);
        
        initProxy().finally(() => clearTimeout(initTimeout));
    }

    // Старт
    if (document.readyState === 'complete') {
        safeInit();
    } else {
        window.addEventListener('load', safeInit);
        document.addEventListener('DOMContentLoaded', safeInit);
    }
})();
