(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Старт инициализации');
    
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        auth: {
            username: 'ваш_логин', // замените на реальные
            password: 'ваш_пароль'
        },
        maxRetries: 30 // лимит попыток
    };

    let retryCount = 0;

    function initPlugin() {
        retryCount++;
        
        if (window.lampa && lampa.interceptor) {
            console.log('[TMDB Proxy] Lampa найдена, активация...');
            
            lampa.interceptor.request.add({
                before: req => {
                    if (/themoviedb\.org/.test(req.url)) {
                        const newUrl = req.url
                            .replace('api.themoviedb.org', config.proxyHost)
                            .replace('image.tmdb.org', config.proxyHost);
                        
                        console.log('[TMDB Proxy] Проксируем запрос:', req.url);
                        
                        return {
                            ...req,
                            url: newUrl,
                            headers: {
                                ...req.headers,
                                'Authorization': 'Basic ' + btoa(config.auth.username + ':' + config.auth.password)
                            }
                        };
                    }
                    return req;
                },
                error: err => {
                    console.error('[TMDB Proxy] Ошибка прокси:', err);
                    return err;
                }
            });
            
            console.log('[TMDB Proxy] Успешно активирован!');
        } 
        else if (retryCount < config.maxRetries) {
            console.log(`[TMDB Proxy] Попытка ${retryCount}/${config.maxRetries}`);
            setTimeout(initPlugin, 500);
        } 
        else {
            console.error('[TMDB Proxy] Lampa не найдена после попыток!');
        }
    }

    // Два способа запуска
    if (window.appready) {
        initPlugin();
    } 
    else {
        document.addEventListener('lampa_state_ready', initPlugin);
        lampa.Listener && lampa.Listener.follow('app', e => e.type === 'ready' && initPlugin());
    }
})();
