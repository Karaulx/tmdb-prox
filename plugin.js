(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v10.0');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    // 1. Проверка доступности прокси (с CORS-прокси для теста)
    async function checkProxy() {
        try {
            // Используем CORS-прокси для проверки, если основной недоступен
            const testUrl = `https://cors-anywhere.herokuapp.com/${CONFIG.proxyHost}/3/movie/550`;
            
            const response = await fetch(testUrl, {
                headers: {
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password),
                    'X-Requested-With': 'XMLHttpRequest'
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

    // 2. Перехватчик без зависимости от Lampa
    function hijackRequests() {
        // Перехват fetch
        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            
            if (url && /themoviedb\.org|image\.tmdb\.org/.test(url)) {
                const newUrl = url
                    .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
                    .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
                
                const newInit = init ? {...init} : {};
                newInit.headers = new Headers(newInit.headers || {});
                newInit.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                
                if (CONFIG.debug) console.log('[TMDB Proxy] Перехвачен запрос:', url, '→', newUrl);
                
                try {
                    return await originalFetch(newUrl, newInit);
                } catch (e) {
                    console.error('[TMDB Proxy] Ошибка запроса:', e);
                    // Fallback на оригинальный запрос при ошибке
                    return originalFetch(input, init);
                }
            }
            
            return originalFetch(input, init);
        };

        // Перехват XMLHttpRequest
        if (window.XMLHttpRequest) {
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
        }

        console.log('[TMDB Proxy] Низкоуровневый перехватчик активирован');
    }

    // 3. Инициализация
    async function init() {
        try {
            // Проверяем прокси через CORS-прокси
            const proxyAvailable = await checkProxy();
            
            if (!proxyAvailable) {
                console.warn('[TMDB Proxy] Прокси недоступен, использую прямой доступ');
                // Можно добавить уведомление для пользователя
                return;
            }
            
            // Активируем перехватчик
            hijackRequests();
            
            console.log('[TMDB Proxy] Успешно инициализирован');
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка инициализации:', error);
        }
    }

    // Запуск
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
        }, 1000);
    }
})();
