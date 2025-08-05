(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Запуск v4.4');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        maxRetries: 5,
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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data && data.id === 550; // Проверяем, что это действительно Fight Club
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка проверки прокси:', error);
            return false;
        }
    }

    // 2. Универсальный перехватчик с улучшенной обработкой ошибок
    function setupProxy() {
        // Для Lampa 3.x/4.x
        if (window.lampa?.interceptor?.request?.add) {
            console.log('[TMDB Proxy] Найдена Lampa API, использую нативный перехватчик');
            
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        req.url = rewriteUrl(req.url);
                        req.headers = req.headers || {};
                        req.headers['Authorization'] = 
                            'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password);
                    }
                    return req;
                },
                error: err => {
                    console.error('[TMDB Proxy] Ошибка запроса:', err);
                    return Promise.reject(err);
                }
            });
            return true;
        }
        
        // Для других версий
        hijackNativeRequests();
        return false;
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
                if (this._url && /themoviedb\.org/.test(this._url)) {
                    this._url = rewriteUrl(this._url);
                    this.setRequestHeader('Authorization', 
                        'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                }
                return originalSend.call(this, data);
            };
            
            return xhr;
        };

        // Перехват fetch
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            
            if (url && /themoviedb\.org/.test(url)) {
                const newUrl = rewriteUrl(url);
                init = init || {};
                init.headers = new Headers(init.headers);
                init.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                
                if (typeof input === 'string') {
                    input = newUrl;
                } else {
                    input = new Request(newUrl, input);
                }
            }
            return originalFetch(input, init).catch(err => {
                console.error('[TMDB Proxy] Fetch error:', err);
                throw err;
            });
        };

        console.log('[TMDB Proxy] Активирован низкоуровневый перехват!');
    }

    function rewriteUrl(url) {
        return url
            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
    }

    // 3. Улучшенная инициализация с повторными попытками
    async function init(retryCount = 0) {
        try {
            if (retryCount >= CONFIG.maxRetries) {
                console.error('[TMDB Proxy] Достигнуто максимальное количество попыток');
                return;
            }

            const proxyAvailable = await checkProxy();
            if (!proxyAvailable) {
                throw new Error('Прокси недоступен');
            }

            if (!setupProxy()) {
                console.log('[TMDB Proxy] Lampa API не найдена, использую альтернативный метод');
            }
            
            console.log('[TMDB Proxy] Успешно инициализирован!');
        } catch (error) {
            console.error(`[TMDB Proxy] Ошибка инициализации (попытка ${retryCount + 1}):`, error);
            
            if (retryCount < CONFIG.maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
                return init(retryCount + 1);
            }
        }
    }

    // Запускаем после полной загрузки
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
        document.addEventListener('DOMContentLoaded', init);
    }
})();
