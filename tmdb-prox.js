// TMDB Proxy Module for Lampa
// GitHub: https://github.com/yourusername/lampa-modules/blob/main/tmdb_proxy.js
// Версия 1.0.2

(function() {
    // Конфигурация (измените под свои настройки)
    const config = {
        enabled: true,
        proxyBaseUrl: 'https://novomih25.duckdns.org:9091',
        apiKey: 'a68d078b1475b51c18e6d4d0f44600f8',
        authEnabled: true,
        authUsername: 'your_username',  // Замените на реальные данные
        authPassword: 'your_password'   // Замените на реальные данные
    };

    // Проверка, что модуль запущен в Lampa
    if (typeof Lampa === 'undefined') {
        console.error('TMDB Proxy: Lampa не обнаружена!');
        return;
    }

    // Основная функция модуля
    function initProxy() {
        if (!config.enabled) return;
        
        const originalRequest = Lampa.Request;
        
        // Переопределяем метод запросов Lampa
        Lampa.Request = function(url, options = {}) {
            // Проксируем только запросы TMDB
            if (url.includes('api.themoviedb.org') || url.includes('image.tmdb.org')) {
                let newUrl = url;
                
                // API запросы
                if (url.includes('api.themoviedb.org/3')) {
                    newUrl = url.replace(
                        'https://api.themoviedb.org/3',
                        config.proxyBaseUrl + '/3'
                    );
                }
                // Запросы изображений
                else if (url.includes('image.tmdb.org/t/p/')) {
                    newUrl = url.replace(
                        'https://image.tmdb.org/t/p/',
                        config.proxyBaseUrl + '/t/p/'
                    );
                }
                
                // Добавляем авторизацию
                if (config.authEnabled) {
                    options.headers = options.headers || {};
                    options.headers['Authorization'] = 'Basic ' + btoa(
                        config.authUsername + ':' + config.authPassword
                    );
                }
                
                console.log('TMDB Proxy:', url, '→', newUrl);
                return originalRequest(newUrl, options);
            }
            
            // Обычные запросы (не TMDB)
            return originalRequest(url, options);
        };
        
        console.log('TMDB Proxy Module успешно активирован!');
    }

    // Запускаем после полной загрузки Lampa
    if (document.readyState === 'complete') {
        initProxy();
    } else {
        window.addEventListener('load', initProxy);
    }
})();
