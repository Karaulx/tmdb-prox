(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v5.1');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        maxRetries: 3,
        retryDelay: 1000,
        debug: true,
        lampaWaitTimeout: 30000, // 30 секунд ожидания загрузки Lampa
        lampaCheckInterval: 500  // Проверка каждые 500 мс
    };

    // 1. Улучшенная проверка загрузки Lampa
    function waitForLampa(callback) {
        const startTime = Date.now();
        
        function check() {
            if (window.lampa) {
                console.log('[TMDB Proxy] Lampa обнаружена');
                callback(true);
                return;
            }
            
            if (Date.now() - startTime > CONFIG.lampaWaitTimeout) {
                console.error('[TMDB Proxy] Таймаут ожидания загрузки Lampa');
                callback(false);
                return;
            }
            
            setTimeout(check, CONFIG.lampaCheckInterval);
        }
        
        check();
    }

    // 2. Проверка прокси
    async function checkProxy() {
        try {
            const response = await fetch(`${CONFIG.proxyHost}/3/movie/550`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data && data.id === 550;
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка проверки прокси:', error);
            return false;
        }
    }

    // 3. Настройка перехватчиков
    function setupInterceptors() {
        try {
            if (window.lampa?.interceptor?.request?.add) {
                console.log('[TMDB Proxy] Используем нативный перехватчик Lampa');
                
                lampa.interceptor.request.add({
                    before: request => {
                        if (isTmdbRequest(request.url)) {
                            return modifyRequest(request);
                        }
                        return request;
                    },
                    error: error => {
                        console.error('[TMDB Proxy] Ошибка запроса:', error);
                        return Promise.reject(error);
                    }
                });
                return true;
            }
            
            hijackNativeRequests();
            return false;
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка настройки перехватчиков:', e);
            hijackNativeRequests();
            return false;
        }
    }

    // 4. Основная инициализация
    async function init() {
        try {
            console.log('[TMDB Proxy] Начало инициализации');
            
            // Проверяем доступность прокси
            const proxyAvailable = await checkProxy();
            if (!proxyAvailable) {
                throw new Error('Прокси недоступен');
            }
            
            // Настраиваем перехватчики
            setupInterceptors();
            
            console.log('[TMDB Proxy] Успешно инициализирован');
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка инициализации:', error);
        }
    }

    // 5. Запуск плагина после загрузки Lampa
    if (!window.tmdbProxyInitialized) {
        window.tmdbProxyInitialized = true;
        
        waitForLampa((success) => {
            if (success) {
                init();
                
                // Добавляем пункт меню для проверки
                if (window.lampa?.Activity) {
                    setTimeout(() => {
                        try {
                            const menuItem = $(`
                                <li class="menu__item selector">
                                    <div class="menu__ico">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                            <path d="M12 7c-.55 0-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1z"/>
                                        </svg>
                                    </div>
                                    <div class="menu__text">Проверить TMDB Proxy</div>
                                </li>
                            `);
                            
                            menuItem.on('hover:enter', () => {
                                init();
                                lampa.Noty.show('Проверка TMDB Proxy...');
                            });
                            
                            $('.menu .menu__list').eq(0).append(menuItem);
                        } catch (e) {
                            console.error('[TMDB Proxy] Ошибка добавления пункта меню:', e);
                        }
                    }, 2000);
                }
            } else {
                console.error('[TMDB Proxy] Не удалось загрузить Lampa');
            }
        });
    }

    // Вспомогательные функции
    function isTmdbRequest(url) {
        return /themoviedb\.org|image\.tmdb\.org/.test(url);
    }

    function modifyRequest(request) {
        const newUrl = rewriteUrl(request.url);
        if (CONFIG.debug) console.log('[TMDB Proxy] Перехвачен запрос:', request.url, '→', newUrl);
        
        return {
            ...request,
            url: newUrl,
            headers: {
                ...request.headers,
                'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
            }
        };
    }

    function hijackNativeRequests() {
        // Реализация hijackNativeRequests остается такой же, как в предыдущем коде
        // ...
    }

    function rewriteUrl(url) {
        return url
            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
    }
})();
