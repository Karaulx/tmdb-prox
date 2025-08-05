(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v11.0');
    
    const CONFIG = {
        // Основной прокси
        proxyHost: 'novomih25.duckdns.org:9091',
        // Резервный прокси (если основной недоступен)
        fallbackProxy: 'https://your-backup-proxy.com',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true,
        // Время ожидания ответа от прокси (мс)
        timeout: 5000
    };

    // 1. Улучшенная проверка прокси с таймаутом
    async function testProxy(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data && data.id === 550;
        } catch (error) {
            if (CONFIG.debug) console.error(`[TMDB Proxy] Ошибка проверки ${url}:`, error);
            return false;
        }
    }

    // 2. Выбор рабочего прокси
    async function getWorkingProxy() {
        // Проверяем основной прокси
        const mainProxyUrl = `${CONFIG.proxyHost}/3/movie/550`;
        if (await testProxy(mainProxyUrl)) {
            if (CONFIG.debug) console.log('[TMDB Proxy] Основной прокси доступен');
            return CONFIG.proxyHost;
        }
        
        // Проверяем резервный прокси
        if (CONFIG.fallbackProxy) {
            const fallbackUrl = `${CONFIG.fallbackProxy}/3/movie/550`;
            if (await testProxy(fallbackUrl)) {
                if (CONFIG.debug) console.log('[TMDB Proxy] Используем резервный прокси');
                return CONFIG.fallbackProxy;
            }
        }
        
        throw new Error('Нет доступных прокси-серверов');
    }

    // 3. Перехватчик запросов
    function setupProxy(proxyUrl) {
        const originalFetch = window.fetch;
        
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            
            if (url && /themoviedb\.org|image\.tmdb\.org/.test(url)) {
                const newUrl = url
                    .replace(/https?:\/\/api\.themoviedb\.org\/3/, proxyUrl + '/3')
                    .replace(/https?:\/\/image\.tmdb\.org/, proxyUrl);
                
                const newInit = init ? {...init} : {};
                newInit.headers = new Headers(newInit.headers || {});
                newInit.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                
                if (CONFIG.debug) console.log('[TMDB Proxy] Перенаправляем запрос:', newUrl);
                
                try {
                    return await originalFetch(newUrl, newInit);
                } catch (error) {
                    console.error('[TMDB Proxy] Ошибка запроса:', error);
                    // Возвращаем оригинальный запрос при ошибке
                    return originalFetch(input, init);
                }
            }
            
            return originalFetch(input, init);
        };

        console.log('[TMDB Proxy] Перехватчик активирован для:', proxyUrl);
    }

    // 4. Основная инициализация
    async function init() {
        try {
            const proxyUrl = await getWorkingProxy();
            setupProxy(proxyUrl);
            
            console.log('[TMDB Proxy] Успешно инициализирован');
            Lampa.Noty.show('TMDB Proxy активен');
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка:', error.message);
            Lampa.Noty.show('Ошибка TMDB Proxy: ' + error.message, 10);
        }
    }

    // Запуск с защитой от повторной инициализации
    if (!window.tmdbProxyInitialized) {
        window.tmdbProxyInitialized = true;
        
        // Отложенный запуск для совместимости
        setTimeout(() => {
            if (document.readyState === 'complete') {
                init();
            } else {
                window.addEventListener('load', init);
                document.addEventListener('DOMContentLoaded', init);
            }
        }, 1500);
    }
})();
