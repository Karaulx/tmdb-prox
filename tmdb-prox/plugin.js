(function() {
    'use strict';

    console.log('TMDB Proxy: Plugin started');

    // Проверка API Lampa
    if (!window.lampa || !lampa.interceptor || !lampa.notice) {
        console.error('Lampa API not found or incomplete!');
        return;
    }

    // Конфигурация плагина
    const config = {
        debug: true,
        tmdbProxyUrl: 'https://your-tmdb-proxy.com/api', // Замените на ваш прокси
        interceptPatterns: [
            /api\.themoviedb\.org\/3\/movie/,
            /api\.themoviedb\.org\/3\/tv/,
            /api\.themoviedb\.org\/3\/search/
        ]
    };

    // Утилиты
    const utils = {
        log: (...args) => {
            if (config.debug) console.log('[TMDB Proxy]', ...args);
        },
        showNotice: (msg, type = 'success') => {
            lampa.notice.show(msg, type);
        }
    };

    // Проверяем, нужно ли перехватывать запрос
    function shouldIntercept(url) {
        return config.interceptPatterns.some(pattern => pattern.test(url));
    }

    // Модифицируем URL для прокси
    function modifyRequestUrl(url) {
        try {
            const parsed = new URL(url);
            const newUrl = new URL(config.tmdbProxyUrl);
            
            // Переносим путь и параметры
            newUrl.pathname = parsed.pathname;
            parsed.searchParams.forEach((value, key) => {
                newUrl.searchParams.append(key, value);
            });

            utils.log(`Proxying request: ${url} -> ${newUrl.toString()}`);
            return newUrl.toString();
        } catch (e) {
            utils.log('Error modifying URL:', e);
            return url;
        }
    }

    // Инициализация перехватчика
    function initInterceptor() {
        const interceptor = {
            before: (req) => {
                if (shouldIntercept(req.url)) {
                    req.url = modifyRequestUrl(req.url);
                    req.headers = req.headers || {};
                    req.headers['X-Proxy-Source'] = 'Lampa-TMDB-Proxy';
                }
                return req;
            },
            after: (res) => {
                if (shouldIntercept(res.url)) {
                    utils.log(`Proxied response from: ${res.url}`);
                    // Здесь можно модифицировать ответ при необходимости
                }
                return res;
            },
            error: (err) => {
                utils.log('Request error:', err);
                return err;
            }
        };

        lampa.interceptor.request.add(interceptor);
        utils.log('Interceptor initialized');
    }

    // Инициализация плагина
    function initPlugin() {
        try {
            initInterceptor();
            utils.showNotice('TMDB Proxy activated');
            
            // Добавляем CSS для возможных будущих UI-элементов
            lampa.utils.addStyle(`
                .tmdb-proxy-badge {
                    background: rgba(1, 180, 228, 0.9);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 11px;
                    margin-left: 5px;
                }
            `);
        } catch (e) {
            console.error('TMDB Proxy init error:', e);
        }
    }

    // Запускаем после небольшой задержки, чтобы Lampa полностью загрузилась
    setTimeout(initPlugin, 1500);

})();
