(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v5.0');
    
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

    // 1. Улучшенная проверка прокси
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

    // 2. Универсальный перехватчик запросов
    function setupInterceptors() {
        // Для Lampa 3.x/4.x
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
        
        // Для старых версий Lampa
        hijackNativeRequests();
        return false;
    }

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
            }
            return originalFetch(input, newInit || init);
        };

        console.log('[TMDB Proxy] Активирован низкоуровневый перехват запросов');
    }

    function rewriteUrl(url) {
        return url
            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
    }

    // 3. Основная инициализация с повторными попытками
    async function init(retryCount = 0) {
        try {
            if (retryCount >= CONFIG.maxRetries) {
                console.error('[TMDB Proxy] Достигнут лимит попыток подключения');
                return;
            }

            if (CONFIG.debug) console.log('[TMDB Proxy] Попытка инициализации', retryCount + 1);
            
            const proxyAvailable = await checkProxy();
            if (!proxyAvailable) {
                throw new Error('Прокси недоступен');
            }

            const usingNativeInterceptor = setupInterceptors();
            
            if (CONFIG.debug) {
                console.log('[TMDB Proxy] Успешно инициализирован', 
                    usingNativeInterceptor ? '(нативный перехватчик)' : '(низкоуровневый перехват)');
            }
        } catch (error) {
            console.error(`[TMDB Proxy] Ошибка инициализации (попытка ${retryCount + 1}):`, error);
            
            if (retryCount < CONFIG.maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
                return init(retryCount + 1);
            }
        }
    }

    // 4. Автоматический запуск
    function startPlugin() {
        if (document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init);
            document.addEventListener('DOMContentLoaded', init);
        }
        
        // Добавляем пункт в меню для ручной проверки
        if (window.lampa?.Activity) {
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
                Lampa.Noty.show('Проверка TMDB Proxy...');
            });
            
            $('.menu .menu__list').eq(0).append(menuItem);
        }
    }

    // Запускаем плагин
    if (!window.tmdbProxyInitialized) {
        window.tmdbProxyInitialized = true;
        startPlugin();
    }
})();
