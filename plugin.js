(function() {
    'use strict';
    
    // Проверка, что плагин еще не загружен
    if (window.tmdbProxyLoaded) return;
    window.tmdbProxyLoaded = true;
    
    console.log('[TMDB Proxy] Встроенная загрузка...');
    
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091'
    };

    // Ожидание Lampa
    function init() {
        if (!window.lampa || !lampa.interceptor) {
            setTimeout(init, 100);
            return;
        }
        
        // Перехватчик запросов
        lampa.interceptor.request.add({
            before: req => {
                if (/themoviedb\.org/.test(req.url)) {
                    const newUrl = req.url.replace(
                        /https?:\/\/(api|image)\.themoviedb\.org(\/3)?/, 
                        config.proxyHost
                    );
                    console.log('[TMDB Proxy]', newUrl);
                    return { ...req, url: newUrl };
                }
                return req;
            }
        });
        
        console.log('[TMDB Proxy] Активирован');
    }
    
    // Автозапуск
    if (window.appready) init();
    else lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
