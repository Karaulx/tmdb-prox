(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v12.0');
    
    const CONFIG = {
        // Основной прокси
        proxies: [
            {
                url: 'https://novomih25.duckdns.org:9091',
                auth: 'Basic ' + btoa('jackett:3p4uh49y')
            },
            // Резервные прокси (добавьте свои)
            {
                url: 'https://tmdb-proxy-alternate.example.com',
                auth: 'Basic ' + btoa('username:password')
            }
        ],
        // Прямые URL как последний резерв
        directUrls: {
            api: 'https://api.themoviedb.org/3',
            images: 'https://image.tmdb.org'
        },
        debug: true,
        testEndpoint: '/movie/550',
        timeout: 3000
    };

    // 1. Улучшенная проверка доступности
    async function testConnection(url, auth) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            const response = await fetch(url + CONFIG.testEndpoint, {
                headers: { 'Authorization': auth },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data && data.id === 550;
        } catch (error) {
            if (CONFIG.debug) console.log(`[TMDB Proxy] Тест ${url}:`, error.message);
            return false;
        }
    }

    // 2. Выбор рабочего соединения
    async function selectConnection() {
        // Проверяем все прокси
        for (const proxy of CONFIG.proxies) {
            const fullUrl = proxy.url + CONFIG.testEndpoint;
            if (await testConnection(proxy.url, proxy.auth)) {
                return {
                    type: 'proxy',
                    url: proxy.url,
                    auth: proxy.auth
                };
            }
        }
        
        // Проверяем прямое соединение как последний вариант
        if (await testConnection(CONFIG.directUrls.api, '')) {
            console.warn('[TMDB Proxy] Используем прямое соединение с TMDB');
            return {
                type: 'direct',
                apiUrl: CONFIG.directUrls.api,
                imageUrl: CONFIG.directUrls.images
            };
        }
        
        throw new Error('Нет доступных соединений');
    }

    // 3. Перехватчик запросов
    function setupInterceptor(connection) {
        const originalFetch = window.fetch;
        
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            
            if (!url) return originalFetch(input, init);
            
            try {
                // Для API запросов
                if (url.includes('api.themoviedb.org')) {
                    const newUrl = connection.type === 'proxy' 
                        ? url.replace(/https?:\/\/api\.themoviedb\.org\/3/, connection.url + '/3')
                        : url;
                    
                    const newInit = init ? {...init} : {};
                    newInit.headers = new Headers(newInit.headers || {});
                    
                    if (connection.type === 'proxy') {
                        newInit.headers.set('Authorization', connection.auth);
                    }
                    
                    if (CONFIG.debug) console.log('[TMDB Proxy] API запрос:', newUrl);
                    return await originalFetch(newUrl, newInit);
                }
                
                // Для изображений
                if (url.includes('image.tmdb.org')) {
                    const newUrl = connection.type === 'proxy'
                        ? url.replace(/https?:\/\/image\.tmdb\.org/, connection.url)
                        : url;
                    
                    if (CONFIG.debug) console.log('[TMDB Proxy] Запрос изображения:', newUrl);
                    return await originalFetch(newUrl, init);
                }
            } catch (error) {
                console.error('[TMDB Proxy] Ошибка перехвата:', error);
            }
            
            return originalFetch(input, init);
        };

        console.log('[TMDB Proxy] Активирован для:', connection.type);
    }

    // 4. Инициализация с диагностикой
    async function init() {
        try {
            const connection = await selectConnection();
            setupInterceptor(connection);
            
            console.log('[TMDB Proxy] Успешно инициализирован');
            
            // Добавляем пункт меню для диагностики
            if (window.lampa?.Activity) {
                const menuItem = $(`
                    <li class="menu__item selector">
                        <div class="menu__ico">🔧</div>
                        <div class="menu__text">TMDB Proxy Status</div>
                    </li>
                `);
                
                menuItem.on('hover:enter', () => {
                    Lampa.Noty.show(`
                        TMDB Proxy: ${connection.type}<br>
                        API: ${connection.type === 'proxy' ? connection.url : connection.apiUrl}<br>
                        Images: ${connection.type === 'proxy' ? connection.url : connection.imageUrl}
                    `, 10);
                });
                
                $('.menu .menu__list').eq(0).append(menuItem);
            }
        } catch (error) {
            console.error('[TMDB Proxy] Критическая ошибка:', error);
            Lampa.Noty.show('TMDB Proxy: ' + error.message, 10);
        }
    }

    // Запуск
    if (!window.tmdbProxyInitialized) {
        window.tmdbProxyInitialized = true;
        
        // Отложенный запуск
        setTimeout(() => {
            if (document.readyState === 'complete') init();
            else {
                window.addEventListener('load', init);
                document.addEventListener('DOMContentLoaded', init);
            }
        }, 2000);
    }
})();
