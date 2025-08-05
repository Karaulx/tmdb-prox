(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Инициализация v6.0 (event-based)');
    
    const CONFIG = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'jackett',
            password: '3p4uh49y'
        },
        debug: true
    };

    // 1. Основная функция инициализации
    function initPlugin() {
        // Проверяем доступность Lampa API
        if (!window.lampa || !window.lampa.interceptor) {
            console.error('[TMDB Proxy] Необходимые компоненты Lampa недоступны');
            return;
        }

        console.log('[TMDB Proxy] Начало инициализации');
        
        // Настройка перехватчика
        lampa.interceptor.request.add({
            before: request => {
                if (isTmdbRequest(request.url)) {
                    return modifyRequest(request);
                }
                return request;
            },
            error: error => {
                console.error('[TMDB Proxy] Ошибка запроса:', error);
                return Promise.reject(error);
            }
        });

        console.log('[TMDB Proxy] Успешно инициализирован');
        
        // Добавляем пункт меню для проверки
        addMenuButton();
    }

    // 2. Добавление кнопки в меню
    function addMenuButton() {
        if (!window.lampa?.Activity) return;
        
        setTimeout(() => {
            try {
                const menuItem = $(`
                    <li class="menu__item selector">
                        <div class="menu__ico">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                <path d="M12 7c-.55 0-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1z"/>
                            </svg>
                        </div>
                        <div class="menu__text">Проверить TMDB Proxy</div>
                    </li>
                `);
                
                menuItem.on('hover:enter', () => {
                    checkProxyStatus();
                });
                
                $('.menu .menu__list').eq(0).append(menuItem);
            } catch (e) {
                console.error('[TMDB Proxy] Ошибка добавления пункта меню:', e);
            }
        }, 2000);
    }

    // 3. Проверка статуса прокси
    async function checkProxyStatus() {
        try {
            lampa.Noty.show('Проверка TMDB Proxy...');
            
            const response = await fetch(`${CONFIG.proxyHost}/3/movie/550`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (data && data.id === 550) {
                lampa.Noty.show('TMDB Proxy работает корректно');
            } else {
                throw new Error('Неверный ответ от прокси');
            }
        } catch (error) {
            console.error('[TMDB Proxy] Ошибка проверки прокси:', error);
            lampa.Noty.show('Ошибка подключения к TMDB Proxy');
        }
    }

    // Вспомогательные функции
    function isTmdbRequest(url) {
        return /themoviedb\.org|image\.tmdb\.org/.test(url);
    }

    function modifyRequest(request) {
        const newUrl = rewriteUrl(request.url);
        if (CONFIG.debug) console.log('[TMDB Proxy] Перехвачен запрос:', request.url, '→', newUrl);
        
        return {
            ...request,
            url: newUrl,
            headers: {
                ...request.headers,
                'Authorization': 'Basic ' + btoa(CONFIG.credentials.username + ':' + CONFIG.credentials.password)
            }
        };
    }

    function rewriteUrl(url) {
        return url
            .replace(/https?:\/\/api\.themoviedb\.org\/3/, CONFIG.proxyHost + '/3')
            .replace(/https?:\/\/image\.tmdb\.org/, CONFIG.proxyHost);
    }

    // 4. Запуск плагина
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                initPlugin();
            }
        });
    }
})();
