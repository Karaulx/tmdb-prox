(function() {
    'use strict';

    // Проверка API Lampa
    if (!window.lampa || !lampa.interceptor) {
        console.error('Lampa API не обнаружена');
        return;
    }

    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        debug: true
    };

    // Основная функция проксирования
    function proxyUrl(url) {
        if (!url || typeof url !== 'string') return url;
        return url.replace(
            /^(http:|https:)?\/\/(api\.themoviedb\.org|image\.tmdb\.org)/, 
            config.proxyHost
        );
    }

    // Перехват API запросов
    lampa.interceptor.request.add({
        before: req => {
            const newUrl = proxyUrl(req.url);
            if (newUrl !== req.url && config.debug) {
                console.log('[TMDB Proxy]', req.url, '→', newUrl);
            }
            return { ...req, url: newUrl };
        }
    });

    // Перехват изображений в DOM
    function proxyImages() {
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes('image.tmdb.org')) {
                img.src = proxyUrl(img.src);
            }
        });
    }

    // Мониторинг изменений DOM
    new MutationObserver(proxyImages).observe(document, {
        childList: true,
        subtree: true
    });

    console.log('TMDB Proxy успешно загружен');
})();
