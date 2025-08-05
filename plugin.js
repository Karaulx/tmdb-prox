(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v12.2 [Ultimate Fix]');
    
    const CONFIG = {
        // Основной прокси (замените на ваш реальный)
        mainProxy: 'https://novomih25.duckdns.org:9092',
        // Резервные варианты
        fallbacks: [
            'https://api.themoviedb.org/3', // Прямое подключение как крайний вариант
            'https://tmdb-proxy-backup.example.com' // Дополнительный резерв
        ],
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        timeout: 8000, // 8 секунд на проверку
        maxRetries: 3 // Количество попыток
    };

    // 1. Улучшенная проверка соединения
    async function testConnection(url, attempt = 1) {
        try {
            console.log(`[TMDB Proxy] Проверка ${url} (попытка ${attempt})`);
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            const testUrl = url.includes('themoviedb.org') 
                ? `${url}/configuration` 
                : `${url}/movie/550`;
            
            const response = await fetch(testUrl, {
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
                await new Promise(resolve => setTimeout(resolve, 2000));
                return testConnection(url, attempt + 1);
            }
            return false;
        }
    }

    // 2. Автоматический выбор соединения
    async function getWorkingConnection() {
        // Сначала проверяем основной прокси
        const mainResult = await testConnection(CONFIG.mainProxy);
        if (mainResult) return mainResult;
        
        // Затем резервные варианты
        for (const fallback of CONFIG.fallbacks) {
            const result = await testConnection(fallback);
            if (result) return result;
        }
        
        throw new Error('Все прокси-серверы недоступны');
    }

    // 3. Универсальный перехватчик запросов
    function setupProxy(proxyUrl) {
        // Для Lampa 3.x/4.x
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
        // Для других случаев
        else {
            setupGlobalInterceptors(proxyUrl);
            console.log('[TMDB Proxy] Подключено через глобальный перехват');
        }
    }

    function processRequest(req, proxyUrl) {
        if (/themoviedb\.org/.test(req.url)) {
            const newUrl = req.url
                .replace(/api\.themoviedb\.org\/3/, proxyUrl + '/3')
                .replace(/image\.tmdb\.org/, proxyUrl);
            
            console.log('[TMDB Proxy] Перенаправление:', req.url);
            
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

    function setupGlobalInterceptors(proxyUrl) {
        // Перехват fetch
        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            if (typeof input === 'string' && /themoviedb\.org/.test(input)) {
                input = input
                    .replace(/api\.themoviedb\.org\/3/, proxyUrl + '/3')
                    .replace(/image\.tmdb\.org/, proxyUrl);
                
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
                    url = url
                        .replace(/api\.themoviedb\.org\/3/, proxyUrl + '/3')
                        .replace(/image\.tmdb\.org/, proxyUrl);
                    
                    arguments[1] = url;
                    this.setRequestHeader('Authorization', 
                        'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password));
                }
                return originalOpen.apply(this, arguments);
            };
            return xhr;
        };
    }

    // 4. Защищенная инициализация
    async function safeInit() {
        try {
            console.log('[TMDB Proxy] Поиск рабочего соединения...');
            const workingUrl = await getWorkingConnection();
            
            console.log('[TMDB Proxy] Используется:', workingUrl);
            setupProxy(workingUrl);
            
        } catch (e) {
            console.error('[TMDB Proxy] Критическая ошибка:', e);
            
            // Аварийный режим - пробуем прямое подключение
            if (confirm('Прокси недоступны. Пробовать прямое подключение к TMDB?')) {
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
