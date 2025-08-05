(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Адаптация для Lampa 2.4.6 (исправленная)');
    
    // Конфигурация (ЗАМЕНИТЕ значения на свои!)
    const CONFIG = {
        // Прокси-сервер (без дублирования https://)
        proxy: 'https://novomih25.duckdns.org:9092/3',
        // Учётные данные из /etc/nginx/.htpasswd
        credentials: {
            username: 'jackett', 
            password: '3p4uh49y'
        }
    };

    // Перехватчик для Lampa 2.x
    const originalRequest = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (/themoviedb\.org/.test(url)) {
            // Исправленная замена URL (без дублирования https://)
            const newUrl = url
                .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxy)
                .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxy.replace('/3', ''));

            console.log('[TMDB Proxy] Перенаправление:', url, '→', newUrl);
            
            // Добавляем авторизацию
            this.setRequestHeader('Authorization', 'Basic ' + btoa(
                CONFIG.credentials.username + ':' + CONFIG.credentials.password
            ));
            
            arguments[1] = newUrl; // Подменяем URL
        }
        return originalRequest.apply(this, arguments);
    };

    // Проверка подключения
    console.log('[TMDB Proxy] Успешно инициализирован! Проверяем прокси...');
    
    // Тестовый запрос для проверки
    const testRequest = new XMLHttpRequest();
    testRequest.open('GET', CONFIG.proxy + '/movie/550');
    testRequest.setRequestHeader('Authorization', 'Basic ' + btoa(
        CONFIG.credentials.username + ':' + CONFIG.credentials.password
    ));
    testRequest.onload = function() {
        if (testRequest.status === 200) {
            console.log('[TMDB Proxy] Прокси работает! Ответ:', JSON.parse(testRequest.responseText));
        } else {
            console.error('[TMDB Proxy] Ошибка прокси:', testRequest.status, testRequest.statusText);
        }
    };
    testRequest.send();

})();
