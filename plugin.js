(function() {
    'use strict';
    
    // Конфигурация
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true,
        maxInitAttempts: 5,
        initRetryDelay: 1000
    };

    // Защита от повторной инициализации
    if (window.tmdbProxyInitialized) {
        console.log('[TMDB Proxy] Плагин уже инициализирован');
        return;
    }
    window.tmdbProxyInitialized = true;

    console.log('[TMDB Proxy] Инициализация v8.0');

    // 1. Проверка готовности Lampa
    function isLampaReady() {
        return window.lampa?.interceptor?.request?.add !== undefined;
    }

    // 2. Основная функция инициализации
    function initPlugin() {
        if (!isLampaReady()) {
            console.error('[TMDB Proxy] Критические компоненты Lampa недоступны');
            return false;
        }

        try {
            // Настройка перехватчика
            lampa.interceptor.request.add({
                before: request => {
                    if (/themoviedb\.org|image\.tmdb\.org/.test(request.url)) {
                        const newUrl = request.url
                            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                        
                        if (CONFIG.debug) console.log('[TMDB Proxy] Перехват:', request.url, '→', newUrl);
                        
                        return {
                            ...request,
                            url: newUrl,
                            headers: {
                                ...request.headers,
                                'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                            }
                        };
                    }
                    return request;
                },
                error: error => {
                    console.error('[TMDB Proxy] Ошибка запроса:', error);
                    return Promise.reject(error);
                }
            });

            console.log('[TMDB Proxy] Успешно инициализирован');
            return true;
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка инициализации:', e);
            return false;
        }
    }

    // 3. Стратегия запуска
    function startInitialization(attempt = 0) {
        if (attempt >= CONFIG.maxInitAttempts) {
            console.error(`[TMDB Proxy] Превышено максимальное количество попыток (${CONFIG.maxInitAttempts})`);
            return;
        }

        if (isLampaReady()) {
            if (initPlugin()) return;
        } else {
            console.log(`[TMDB Proxy] Ожидание Lampa (попытка ${attempt + 1}/${CONFIG.maxInitAttempts})`);
        }

        setTimeout(() => startInitialization(attempt + 1), CONFIG.initRetryDelay);
    }

    // 4. Альтернативные методы инициализации
    function tryAlternativeInitMethods() {
        // Вариант через событие app:ready
        if (window.Lampa?.Listener?.follow) {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') initPlugin();
            });
            return;
        }

        // Вариант через событие DOMContentLoaded
        if (document.readyState !== 'complete') {
            document.addEventListener('DOMContentLoaded', () => startInitialization());
            return;
        }

        // Последняя попытка
        startInitialization();
    }

    // Запуск
    if (document.readyState === 'complete') {
        startInitialization();
    } else {
        tryAlternativeInitMethods();
    }
})();
