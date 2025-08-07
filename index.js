(function () {
    // URL прокси TMDB (с Nginx)
    const TMDB_PROXY = 'https://novomih25.duckdns.org:9092/tmdb-api';

    const Request = Lampa.Request;
    const originalTmdbApi = Lampa.TMDB.api;

    function cleanApiUrl(url) {
        return String(url)
            .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '') // удаляем полную ссылку
            .replace(/^\/?3\//, '')                               // удаляем /3/
            .replace(/^\/+/, '')                                 // лишние /
            .replace(/(\?|&)api_key=[^&]*/g, '')                 // удаляем api_key
            .replace(/\?&/, '?')                                 // лишние символы
            .replace(/&+$/, '');                                 // лишние &
    }

    function buildProxyUrl(url) {
        const cleaned = cleanApiUrl(url);
        return `${TMDB_PROXY}/${cleaned}`;
    }

    // Переопределяем TMDB.api
    Lampa.TMDB.api = function (url, callback, error) {
        const proxyUrl = buildProxyUrl(url);
        console.log('[TMDB Proxy] TMDB.api:', url, '→', proxyUrl);
        return originalTmdbApi(proxyUrl, callback, error);
    };

    // Переопределяем Request для прямых fetch
    Request.tmdb = function (url) {
        const proxyUrl = buildProxyUrl(url);
        console.log('[TMDB Proxy] Request.tmdb:', url, '→', proxyUrl);
        return fetch(proxyUrl).then(r => r.json());
    };

    console.log('[TMDB Proxy] Проксирование TMDB через', TMDB_PROXY);
})();
