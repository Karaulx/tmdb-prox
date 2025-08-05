(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Плагин v12.7 [Full Fix]');
    
    // Конфигурация (ЗАМЕНИТЕ НА СВОИ!)
    const CONFIG = {
        proxy: 'https://novomih25.duckdns.org:9092/3',
        imageProxy: 'https://novomih25.duckdns.org:9092',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        forceProxy: true
    };

    // 1. Перехватчик для XMLHttpRequest (API запросы)
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
        open(method, url) {
            if (/themoviedb\.org/.test(url)) {
                const newUrl = url
                    .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxy)
                    .replace(/([?&])api_key=[^&]+&?/, '$1');
                
                console.log('[TMDB Proxy] API:', url, '→', newUrl);
                super.open(method, newUrl);
                this.setRequestHeader('Authorization', 'Basic ' + btoa(
                    CONFIG.credentials.username + ':' + CONFIG.credentials.password
                ));
            } else {
                super.open(method, url);
            }
        }
    };

    // 2. Перехватчик для fetch (если Lampa использует его)
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
        if (/themoviedb\.org/.test(url)) {
            const newUrl = url
                .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxy)
                .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.imageProxy);
            
            console.log('[TMDB Proxy] Fetch:', url, '→', newUrl);
            return originalFetch(newUrl, {
                ...options,
                headers: {
                    ...options?.headers,
                    'Authorization': 'Basic ' + btoa(
                        CONFIG.credentials.username + ':' + CONFIG.credentials.password
                    )
                }
            });
        }
        return originalFetch(url, options);
    };

    // 3. Перехватчик для изображений
    const originalCreateElement = document.createElement;
    document.createElement = function(tag) {
        const el = originalCreateElement.apply(this, arguments);
        if (tag.toLowerCase() === 'img') {
            const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
            Object.defineProperty(el, 'src', {
                set: function(value) {
                    if (/image\.tmdb\.org/.test(value)) {
                        const newUrl = value.replace(
                            'https://image.tmdb.org', 
                            CONFIG.imageProxy
                        );
                        console.log('[TMDB Proxy] Изображение:', newUrl);
                        originalSrc.set.call(this, newUrl);
                    } else {
                        originalSrc.set.call(this, value);
                    }
                },
                get: function() {
                    return originalSrc.get.call(this);
                }
            });
        }
        return el;
    };

    // 4. Проверка прокси при загрузке
    async function testProxy() {
        try {
            const test = await fetch(`${CONFIG.proxy}/movie/550`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(
                        CONFIG.credentials.username + ':' + CONFIG.credentials.password
                    )
                }
            });
            if (!test.ok) throw new Error('HTTP ' + test.status);
            console.log('[TMDB Proxy] Тест успешен!');
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка:', e);
            alert('Прокси недоступен! Проверьте:\n1. Сервер\n2. Логин/пароль\n3. Порт 9092');
        }
    }

    // Запуск
    if (CONFIG.forceProxy) {
        console.log('[TMDB Proxy] Принудительное включение');
        setupProxy();
    } else {
        testProxy().then(setupProxy);
    }

    function setupProxy() {
        console.log('[TMDB Proxy] Активирован!');
        // Для Lampa 4.x+
        if (window.lampa?.interceptor?.request?.add) {
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        const newUrl = req.url
                            .replace(/api\.themoviedb\.org\/3/, CONFIG.proxy)
                            .replace(/image\.tmdb\.org/, CONFIG.imageProxy);
                        
                        return {
                            ...req,
                            url: newUrl,
                            headers: {
                                ...req.headers,
                                'Authorization': 'Basic ' + btoa(
                                    CONFIG.credentials.username + ':' + CONFIG.credentials.password
                                )
                            }
                        };
                    }
                    return req;
                }
            });
        }
    }
})();
