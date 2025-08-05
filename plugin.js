(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v12.4 [Emergency Fix]');
    
    const CONFIG = {
        // Основной прокси (проверьте доступность)
        proxies: [
            {
                url: 'https://novomih25.duckdns.org:9092/3',
                testPath: '/movie/550'
            },
            {
                url: 'https://api.themoviedb.org/3',
                testPath: '/configuration',
                noAuth: true // Не требует авторизации
            }
        ],
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        timeout: 8000,
        maxRetries: 2
    };

    // 1. Улучшенная проверка соединения
    async function testConnection(proxy, attempt = 1) {
        try {
            console.log(`[TMDB Proxy] Проверка ${proxy.url} (${attempt}/${CONFIG.maxRetries})`);
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            const headers = {};
            if (!proxy.noAuth) {
                headers.Authorization = 'Basic ' + btoa(
                    CONFIG.credentials.username + ':' + CONFIG.credentials.password
                );
            }
            
            const response = await fetch(proxy.url + proxy.testPath, {
                signal: controller.signal,
                headers
            });
            
            clearTimeout(timeout);
            return response.ok ? proxy.url : false;
        } catch (e) {
            console.warn(`[TMDB Proxy] Ошибка проверки ${proxy.url}:`, e.message);
            if (attempt < CONFIG.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                return testConnection(proxy, attempt + 1);
            }
            return false;
        }
    }

    // 2. Выбор рабочего соединения
    async function getWorkingConnection() {
        for (const proxy of CONFIG.proxies) {
            const result = await testConnection(proxy);
            if (result) return result;
        }
        throw new Error('Все прокси-серверы недоступны');
    }

    // 3. Обработка запросов
    function processRequest(req, proxyUrl) {
        if (/themoviedb\.org/.test(req.url)) {
            const isImage = req.url.includes('image.tmdb.org');
            const newUrl = isImage
                ? req.url.replace(/image\.tmdb\.org/, proxyUrl.replace('/3', ''))
                : req.url.replace(/api\.themoviedb\.org\/3/, proxyUrl);
            
            const headers = { ...req.headers };
            if (!proxyUrl.includes('themoviedb.org')) {
                headers.Authorization = 'Basic ' + btoa(
                    CONFIG.credentials.username + ':' + CONFIG.credentials.password
                );
            }
            
            return {
                ...req,
                url: newUrl,
                headers
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
                error: err => console.error('[TMDB Proxy] Ошибка:', err)
            });
        } 
        // Глобальный перехват
        else {
            const originalFetch = window.fetch;
            window.fetch = (input, init) => {
                if (typeof input === 'string' && /themoviedb\.org/.test(input)) {
                    const processed = processRequest({ url: input, headers: init?.headers }, proxyUrl);
                    init = { ...init, headers: processed.headers };
                    input = processed.url;
                }
                return originalFetch(input, init);
            };
        }
        console.log('[TMDB Proxy] Активное соединение:', proxyUrl);
    }

    // 5. Аварийный режим
    function emergencyMode() {
        console.warn('[TMDB Proxy] Активирован аварийный режим');
        setupProxy('https://api.themoviedb.org/3');
        alert('Прокси недоступны. Используется прямое подключение к TMDB');
    }

    // 6. Защищенная инициализация
    async function safeInit() {
        try {
            const workingUrl = await getWorkingConnection();
            setupProxy(workingUrl);
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка:', e);
            emergencyMode();
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
