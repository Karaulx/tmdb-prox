(function() {
    const API_KEY = 'a68d078b1475b51c18e6d4d0f44600f8'; // TMDB API key (v3)
    const PROXY_API = 'https://novomih25.duckdns.org:9092/tmdb-api';
    const PROXY_IMG = 'https://novomih25.duckdns.org:9092/tmdb-image';

    const originalFetch = window.fetch;

    window.fetch = function(input, init = {}) {
        try {
            let url = typeof input === 'string' ? input : input.url;

            // Заменяем api.themoviedb.org
            if (url.includes('api.themoviedb.org')) {
                url = url.replace('https://api.themoviedb.org/3', PROXY_API);
                if (!url.includes('api_key=')) {
                    url += (url.includes('?') ? '&' : '?') + 'api_key=' + API_KEY;
                }
                input = url;
            }

            // Заменяем image.tmdb.org
            if (url.includes('image.tmdb.org')) {
                url = url.replace('https://image.tmdb.org', PROXY_IMG);
                input = url;
            }

        } catch (e) {
            console.error('[TMDB PROXY ERROR]', e);
        }

        return originalFetch.call(this, input, init);
    };

    console.log('%cTMDB прокси активирован через Nginx', 'color: #00aaff');
})();
