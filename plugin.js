(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Плагин v12.9 [Fixed Images]');
    
    const CONFIG = {
        proxy: 'https://novomih25.duckdns.org:9092/3',
        imageProxy: 'https://novomih25.duckdns.org:9092',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        }
    };

    // 1. Перехватчик для XMLHttpRequest и fetch
    const interceptRequests = () => {
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = class extends originalXHR {
            open(method, url) {
                if (/themoviedb\.org/.test(url)) {
                    url = this._replaceUrl(url);
                    super.open(method, url);
                    this.setRequestHeader('Authorization', this._getAuthHeader());
                } else {
                    super.open(method, url);
                }
            }
        };

        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
            if (typeof input === 'string' && /themoviedb\.org/.test(input)) {
                const url = this._replaceUrl(input);
                const options = init || {};
                options.headers = {
                    ...options.headers,
                    'Authorization': this._getAuthHeader()
                };
                return originalFetch(url, options);
            }
            return originalFetch(input, init);
        };
    };

    // 2. Перехватчик для изображений
    const interceptImages = () => {
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName, options) {
            const element = originalCreateElement.call(this, tagName, options);
            if (tagName.toLowerCase() === 'img') {
                const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
                Object.defineProperty(element, 'src', {
                    set: function(value) {
                        if (/image\.tmdb\.org/.test(value)) {
                            const newUrl = value.replace(
                                /https?:\/\/image\.tmdb\.org/,
                                CONFIG.imageProxy
                            );
                            console.log('[TMDB Proxy] Замена изображения:', newUrl);
                            descriptor.set.call(this, newUrl);
                        } else {
                            descriptor.set.call(this, value);
                        }
                    },
                    get: function() {
                        return descriptor.get.call(this);
                    }
                });
            }
            return element;
        };
    };

    // 3. Вспомогательные методы
    const helpers = {
        _replaceUrl: function(url) {
            return url
                .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxy)
                .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.imageProxy);
        },
        _getAuthHeader: function() {
            return 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password);
        }
    };

    // 4. Инициализация
    const init = () => {
        interceptRequests();
        interceptImages();
        
        // Для Lampa 4.x+
        if (window.lampa?.interceptor?.request?.add) {
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        return {
                            ...req,
                            url: helpers._replaceUrl(req.url),
                            headers: {
                                ...req.headers,
                                'Authorization': helpers._getAuthHeader()
                            }
                        };
                    }
                    return req;
                }
            });
        }
        
        console.log('[TMDB Proxy] Успешно активирован!');
    };

    // Автозапуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
