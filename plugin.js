(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v9.0');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        maxLampaWaitTime: 10000, // 10 секунд максимального ожидания
        checkInterval: 300,
        debug: true
    };

    // 1. Улучшенное ожидание Lampa с таймаутом
    function waitForLampa() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkLampa = () => {
                if (window.lampa) {
                    if (CONFIG.debug) console.log('[TMDB Proxy] Lampa обнаружена');
                    resolve();
                    return;
                }
                
                if (Date.now() - startTime > CONFIG.maxLampaWaitTime) {
                    console.error('[TMDB Proxy] Таймаут ожидания Lampa');
                    reject(new Error('Lampa не загрузилась в течение ' + CONFIG.maxLampaWaitTime + 'мс'));
                    return;
                }
                
                setTimeout(checkLampa, CONFIG.checkInterval);
            };
            
            checkLampa();
        });
    }

    // 2. Проверка прокси с обработкой ошибок
    async function checkProxy() {
        try {
            const testUrl = `${CONFIG.proxyHost}/3/movie/550`;
            const response = await fetch(testUrl, {
                headers: {
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP статус: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data || data.id !== 550) {
                throw new Error('Неверный ответ от прокси');
            }
            
            return true;
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка проверки прокси:', error);
            return false;
        }
    }

    // 3. Универсальный перехватчик запросов
    function setupProxy() {
        // Для Lampa 3.x/4.x
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
        
        // Fallback для старых версий
        hijackNativeRequests();
        return false;
    }

    // 4. Низкоуровневый перехват для совместимости
    function hijackNativeRequests() {
        // Перехват XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            
            xhr.open = function(method, url) {
                this._url = url;
                return originalOpen.apply(this, arguments);
            };
            
            xhr.send = function(data) {
                if (this._url && /themoviedb\.org|image\.tmdb\.org/.test(this._url)) {
                    const newUrl = this._url
                        .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                        .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                    
                    this._url = newUrl;
                    this.setRequestHeader('Authorization', 
                        'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                    
                    if (CONFIG.debug) console.log('[TMDB Proxy] Перехвачен XHR:', this._url);
                }
                return originalSend.call(this, data);
            };
            
            return xhr;
        };

        // Перехват fetch
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            
            if (url && /themoviedb\.org|image\.tmdb\.org/.test(url)) {
                const newUrl = url
                    .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                    .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                
                const newInit = init ? {...init} : {};
                newInit.headers = new Headers(newInit.headers);
                newInit.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                
                if (CONFIG.debug) console.log('[TMDB Proxy] Перехвачен fetch:', url, '→', newUrl);
                
                if (typeof input === 'string') {
                    return originalFetch(newUrl, newInit);
                } else {
                    return originalFetch(new Request(newUrl, input), newInit);
                }
            }
            
            return originalFetch(input, init);
        };

        console.log('[TMDB Proxy] Активирован низкоуровневый перехват');
    }

    // 5. Основная инициализация
    async function init() {
        try {
            // Ждем Lampa или продолжаем без нее
            try {
                await waitForLampa();
            } catch (e) {
                console.warn('[TMDB Proxy] Lampa не обнаружена, использую fallback методы');
            }
            
            // Проверяем прокси
            const proxyAvailable = await checkProxy();
            if (!proxyAvailable) {
                throw new Error('Прокси недоступен');
            }
            
            // Настраиваем перехватчик
            if (!setupProxy()) {
                console.log('[TMDB Proxy] Используется низкоуровневый перехват');
            }
            
            console.log('[TMDB Proxy] Успешно инициализирован');
        } catch (error) {
            console.error('[TMDB Proxy] Критическая ошибка:', error);
        }
    }

    // Запуск
    if (!window.tmdbProxyInitialized) {
        window.tmdbProxyInitialized = true;
        
        if (document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init);
            document.addEventListener('DOMContentLoaded', init);
        }
    }
})();
