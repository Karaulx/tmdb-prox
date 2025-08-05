(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v7.0 (Stable)');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    // 1. Основная функция инициализации
    function initPlugin() {
        // Проверяем наличие необходимых компонентов Lampa
        if (!window.lampa?.interceptor?.request?.add) {
            console.error('[TMDB Proxy] Требуемые компоненты Lampa не найдены');
            return false;
        }

        console.log('[TMDB Proxy] Настройка перехватчика запросов');
        
        // Настройка перехватчика
        lampa.interceptor.request.add({
            before: request => {
                if (isTmdbRequest(request.url)) {
                    const modified = modifyRequest(request);
                    if (CONFIG.debug) console.log('[TMDB Proxy] Перехвачен запрос:', request.url, '→', modified.url);
                    return modified;
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
    }

    // 2. Проверка типа запроса
    function isTmdbRequest(url) {
        return /themoviedb\.org|image\.tmdb\.org/.test(url);
    }

    // 3. Модификация запроса
    function modifyRequest(request) {
        const newUrl = rewriteUrl(request.url);
        return {
            ...request,
            url: newUrl,
            headers: {
                ...request.headers,
                'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
            }
        };
    }

    // 4. Переписывание URL
    function rewriteUrl(url) {
        return url
            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
    }

    // 5. Стратегия запуска
    function startPlugin() {
        // Вариант 1: Lampa уже загружена
        if (window.lampa) {
            initPlugin();
            return;
        }

        // Вариант 2: Ожидание через Listener API
        if (window.Lampa?.Listener) {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    initPlugin();
                }
            });
            return;
        }

        // Вариант 3: Резервный таймер (максимум 5 попыток)
        let attempts = 0;
        const maxAttempts = 5;
        const interval = setInterval(() => {
            attempts++;
            if (window.lampa) {
                clearInterval(interval);
                initPlugin();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('[TMDB Proxy] Не удалось инициализировать (таймаут ожидания Lampa)');
            }
        }, 1000);
    }

    // Защита от повторной инициализации
    if (!window.tmdbProxyInitialized) {
        window.tmdbProxyInitialized = true;
        startPlugin();
    }
})();
