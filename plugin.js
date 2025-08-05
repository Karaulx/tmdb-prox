(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v12.3 [Path Fix]');
    
    const CONFIG = {
        // Основной прокси с /3/ в пути
        mainProxy: 'https://novomih25.duckdns.org:9092/3',
        // Резервные варианты
        fallbacks: [
            'https://api.themoviedb.org/3' // Прямое подключение как крайний вариант
        ],
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        timeout: 5000, // 5 секунд на проверку
        maxRetries: 2 // Количество попыток
    };

    // 1. Проверка соединения с прокси
    async function testConnection(url, attempt = 1) {
        try {
            console.log(`[TMDB Proxy] Проверка ${url} (попытка ${attempt})`);
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            // Для прокси используем /movie/550, для TMDB API - /configuration
            const testPath = url.includes('themoviedb.org') ? '/configuration' : '/movie/550';
            const response = await fetch(url + testPath, {
                signal: controller.signal,
                headers: {
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                }
            });
            
            clearTimeout(timeout);
            return response.ok ? url : false;
        } catch (e) {
            console.warn(`[TMDB Proxy] Ошибка проверки ${url}:`, e.message);
            if (attempt < CONFIG.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return testConnection(url, attempt + 1);
            }
            return false;
        }
    }

    // 2. Выбор рабочего соединения
    async function getWorkingConnection() {
        // Проверяем основной прокси
        const mainResult = await testConnection(CONFIG.mainProxy);
        if (mainResult) return mainResult;
        
        // Проверяем резервные варианты
        for (const fallback of CONFIG.fallbacks) {
            const result = await testConnection(fallback);
            if (result) return result;
        }
        
        throw new Error('Все прокси-серверы недоступны');
    }

    // 3. Обработка запросов
    function processRequest(req, proxyUrl) {
        if (/themoviedb\.org/.test(req.url)) {
            const isImage = req.url.includes('image.tmdb.org');
            const newUrl = isImage
                ? req.url.replace(/https?:\/\/image\.tmdb\.org/, proxyUrl.replace('/3', ''))
                : req.url.replace(/https?:\/\/api\.themoviedb\.org\/3/, proxyUrl);
            
            console.log(`[TMDB Proxy] ${isImage ? 'Изображение' : 'API'}: ${req.url} -> ${newUrl}`);
            
            return {
                ...req,
                url: newUrl,
                headers: {
                    ...req.headers,
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                }
            };
        }
        return req;
    }

    // 4. Настройка перехватчиков
    function setupProxy(proxyUrl) {
        // Для Lampa
        if (window.lampa?.interceptor?.request?.add) {
            lampa.interceptor.request.add({
                before: req => processRequest(req, proxyUrl),
                error: err => {
                    console.error('[TMDB Proxy] Ошибка запроса:', err);
                    return err;
                }
            });
            console.log('[TMDB Proxy] Подключено через Lampa API');
        } 
        // Глобальный перехват
        else {
            setupGlobalInterceptors(proxyUrl);
            console.log('[TMDB Proxy] Подключено через глобальный перехват');
        }
    }

    function setupGlobalInterceptors(proxyUrl) {
        // Перехват fetch
        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            if (typeof input === 'string' && /themoviedb\.org/.test(input)) {
                const isImage = input.includes('image.tmdb.org');
                input = isImage
                    ? input.replace(/https?:\/\/image\.tmdb\.org/, proxyUrl.replace('/3', ''))
                    : input.replace(/https?:\/\/api\.themoviedb\.org\/3/, proxyUrl);
                
                init = init || {};
                init.headers = new Headers(init.headers);
                init.headers.set('Authorization', 
                    'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
            }
            return originalFetch(input, init);
        };

        // Перехват XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url) {
                if (/themoviedb\.org/.test(url)) {
                    const isImage = url.includes('image.tmdb.org');
                    url = isImage
                        ? url.replace(/https?:\/\/image\.tmdb\.org/, proxyUrl.replace('/3', ''))
                        : url.replace(/https?:\/\/api\.themoviedb\.org\/3/, proxyUrl);
                    
                    arguments[1] = url;
                    this.setRequestHeader('Authorization', 
                        'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                }
                return originalOpen.apply(this, arguments);
            };
            return xhr;
        };
    }

    // 5. Защищенная инициализация
    async function safeInit() {
        try {
            console.log('[TMDB Proxy] Поиск рабочего соединения...');
            const workingUrl = await getWorkingConnection();
            
            console.log('[TMDB Proxy] Активное соединение:', workingUrl);
            setupProxy(workingUrl);
            
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка инициализации:', e);
            
            // Аварийный режим
            if (confirm('Прокси недоступны. Использовать прямое подключение к TMDB?')) {
                setupProxy('https://api.themoviedb.org/3');
            }
        }
    }

    // Запуск
    if (document.readyState === 'complete') {
        safeInit();
    } else {
        window.addEventListener('load', safeInit);
        document.addEventListener('DOMContentLoaded', safeInit);
    }
})();
