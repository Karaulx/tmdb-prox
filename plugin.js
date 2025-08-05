(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v12.6 [Manual Verify]');
    
    // Конфигурация (ЗАМЕНИТЕ значения на свои!)
    const CONFIG = {
        // Основной прокси (должен быть доступен)
        proxy: 'https://novomih25.duckdns.org:9092/3',
        // Учётные данные из /etc/nginx/.htpasswd
        credentials: {
            username: 'jackett', 
            password: '3p4uh49y'
        },
        // Принудительно использовать этот прокси (true/false)
        forceProxy: true
    };

    // 1. Проверка прокси вручную (раскомментируйте для теста)
    async function manualProxyCheck() {
        console.log('[TMDB Proxy] Ручная проверка прокси...');
        try {
            const testUrl = `${CONFIG.proxy}/movie/550`;
            const response = await fetch(testUrl, {
                headers: {
                    'Authorization': 'Basic ' + btoa(
                        CONFIG.credentials.username + ':' + CONFIG.credentials.password
                    )
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('[TMDB Proxy] Прокси работает! Ответ:', data);
            return true;
        } catch (e) {
            console.error('[TMDB Proxy] Ошибка проверки прокси:', e);
            alert(`Прокси недоступен! Ошибка: ${e.message}\nПроверьте:\n1. Доступность сервера\n2. Логин/пароль\n3. Порт 9092`);
            return false;
        }
    }

    // 2. Настройка перехватчика
    function setupProxy() {
        // Для Lampa 3.x/4.x
        if (window.lampa?.interceptor?.request?.add) {
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        const newUrl = req.url
                            .replace(/api\.themoviedb\.org\/3/, CONFIG.proxy)
                            .replace(/image\.tmdb\.org/, CONFIG.proxy.replace('/3', ''));
                        
                        console.log('[TMDB Proxy] Перенаправление:', req.url, '→', newUrl);
                        
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
            console.log('[TMDB Proxy] Успешно подключен к Lampa!');
        } else {
            console.error('[TMDB Proxy] Lampa API не найден!');
        }
    }

    // 3. Инициализация
    async function init() {
        if (CONFIG.forceProxy || await manualProxyCheck()) {
            setupProxy();
        } else {
            console.error('[TMDB Proxy] Прокси не прошёл проверку!');
        }
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
        document.addEventListener('DOMContentLoaded', init);
    }
})();
