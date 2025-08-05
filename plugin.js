(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v5.2');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        maxRetries: 3,
        retryDelay: 1000,
        debug: true
    };

    // 1. Проверка доступности Lampa
    function isLampaLoaded() {
        return typeof window.lampa !== 'undefined' && 
               window.lampa !== null && 
               typeof window.lampa.interceptor !== 'undefined';
    }

    // 2. Основная функция инициализации
    async function initPlugin() {
        try {
            if (CONFIG.debug) console.log('[TMDB Proxy] Проверка прокси...');
            
            const proxyAvailable = await checkProxy();
            if (!proxyAvailable) {
                console.error('[TMDB Proxy] Прокси недоступен');
                return false;
            }

            setupInterceptors();
            
            if (CONFIG.debug) console.log('[TMDB Proxy] Плагин успешно инициализирован');
            return true;
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка инициализации:', error);
            return false;
        }
    }

    // 3. Проверка прокси
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

    // 4. Настройка перехватчиков
    function setupInterceptors() {
        if (isLampaLoaded() && window.lampa.interceptor?.request?.add) {
            if (CONFIG.debug) console.log('[TMDB Proxy] Используем нативный перехватчик Lampa');
            
            window.lampa.interceptor.request.add({
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
        } else {
            if (CONFIG.debug) console.log('[TMDB Proxy] Используем низкоуровневый перехват');
            hijackNativeRequests();
        }
    }

    // 5. Запуск плагина
    function startPlugin() {
        if (window.tmdbProxyInitialized) {
            if (CONFIG.debug) console.log('[TMDB Proxy] Плагин уже инициализирован');
            return;
        }

        window.tmdbProxyInitialized = true;
        
        // Пытаемся инициализировать сразу, если Lampa уже загружена
        if (isLampaLoaded()) {
            initPlugin();
            return;
        }

        // Если Lampa еще не загружена, ждем события загрузки
        const onReady = () => {
            document.removeEventListener('DOMContentLoaded', onReady);
            window.removeEventListener('load', onReady);
            
            if (isLampaLoaded()) {
                initPlugin();
            } else {
                console.error('[TMDB Proxy] Lampa не обнаружена после загрузки страницы');
            }
        };

        document.addEventListener('DOMContentLoaded', onReady);
        window.addEventListener('load', onReady);
        
        // Добавляем таймаут на случай, если события не сработают
        setTimeout(() => {
            if (!isLampaLoaded()) {
                console.error('[TMDB Proxy] Таймаут ожидания Lampa');
            }
        }, 10000);
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
                if (this._url && isTmdbRequest(this._url)) {
                    const modified = modifyRequest({ url: this._url });
                    this._url = modified.url;
                    Object.entries(modified.headers).forEach(([key, value]) => {
                        this.setRequestHeader(key, value);
                    });
                }
                return originalSend.call(this, data);
            };
            
            return xhr;
        };

        // Перехват fetch
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            
            if (url && isTmdbRequest(url)) {
                const modified = modifyRequest({ 
                    url, 
                    headers: init?.headers || {} 
                });
                
                const newInit = {
                    ...init,
                    headers: new Headers(modified.headers)
                };
                
                if (typeof input === 'string') {
                    input = modified.url;
                } else {
                    input = new Request(modified.url, input);
                }
                
                if (CONFIG.debug) console.log('[TMDB Proxy] Перехвачен fetch:', url, '→', modified.url);
                return originalFetch(input, newInit);
            }
            return originalFetch(input, init);
        };

        if (CONFIG.debug) console.log('[TMDB Proxy] Активирован низкоуровневый перехват запросов');
    }

    function rewriteUrl(url) {
        return url
            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
    }

    // Запускаем плагин
    startPlugin();
})();
