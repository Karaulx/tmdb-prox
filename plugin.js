(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v8.1');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        maxLampaWaitAttempts: 10,
        lampaWaitDelay: 500,
        debug: true
    };

    // 1. Функция ожидания загрузки Lampa
    function waitForLampa(attempt = 1) {
        return new Promise((resolve, reject) => {
            if (window.lampa) {
                if (CONFIG.debug) console.log('[TMDB Proxy] Lampa найдена');
                resolve();
            } 
            else if (attempt >= CONFIG.maxLampaWaitAttempts) {
                console.error('[TMDB Proxy] Lampa не загрузилась после', CONFIG.maxLampaWaitAttempts, 'попыток');
                reject();
            }
            else {
                if (CONFIG.debug) console.log('[TMDB Proxy] Ожидание Lampa (попытка', attempt + '/' + CONFIG.maxLampaWaitAttempts + ')');
                setTimeout(() => waitForLampa(attempt + 1).then(resolve).catch(reject), CONFIG.lampaWaitDelay);
            }
        });
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

    // 3. Установка перехватчиков
    function setupInterceptors() {
        // Нативный перехватчик Lampa
        if (window.lampa?.interceptor?.request?.add) {
            lampa.interceptor.request.add({
                before: request => {
                    if (/themoviedb\.org|image\.tmdb\.org/.test(request.url)) {
                        const newUrl = request.url
                            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                        
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
                    return request;
                },
                error: error => {
                    console.error('[TMDB Proxy] Ошибка запроса:', error);
                    return Promise.reject(error);
                }
            });
            return true;
        }
        return false;
    }

    // 4. Основная инициализация
    async function init() {
        try {
            await waitForLampa();
            
            const proxyAvailable = await checkProxy();
            if (!proxyAvailable) {
                throw new Error('Прокси недоступен');
            }

            if (setupInterceptors()) {
                console.log('[TMDB Proxy] Успешно инициализирован (нативный перехватчик)');
            } else {
                console.log('[TMDB Proxy] Lampa API не найдена, требуется альтернативный метод');
                // Здесь можно добавить fallback-логику
            }
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка инициализации:', error);
        }
    }

    // 5. Автоматический запуск
    function startPlugin() {
        if (document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init);
            document.addEventListener('DOMContentLoaded', init);
        }
    }

    // Защита от повторной инициализации
    if (!window.tmdbProxyInitialized) {
        window.tmdbProxyInitialized = true;
        startPlugin();
    }
})();
