(function() {
    // Конфигурация
    const PROXY_URL = "https://tmdb-prox.pages.dev";
    const API_KEY = "a68d078b1475b51c18e6d4d0f44600f8";

    // 1. Перехватываем стандартные URL Lampa
    if (window.tmdb?.native?.url) {
        window.tmdb.native.url = `${PROXY_URL}/3/`;
    }

    // 2. Перехватываем fetch
    const originalFetch = window.fetch;
    window.fetch = async (url, opts) => {
        if (typeof url === 'string') {
            // Перенаправляем TMDB API запросы
            if (url.includes('api.themoviedb.org/3')) {
                const path = url.split('api.themoviedb.org/3/')[1];
                const cleanPath = path.split('?')[0];
                const query = url.includes('?') ? url.split('?')[1] : '';
                
                // Удаляем старый api_key из query
                const cleanQuery = query.replace(/(^|&)api_key=[^&]*/, '');
                
                url = `${PROXY_URL}/3/${cleanPath}?${cleanQuery}&api_key=${API_KEY}`;
            }
            // Перенаправляем запросы изображений
            else if (url.includes('image.tmdb.org/t/p/')) {
                const path = url.split('image.tmdb.org/t/p/')[1];
                url = `${PROXY_URL}/t/p/${path}`;
            }
        }
        return originalFetch(url, opts);
    };

    // 3. Перехватываем XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
        open(method, url) {
            if (url.includes('api.themoviedb.org/3')) {
                const path = url.split('api.themoviedb.org/3/')[1];
                const cleanPath = path.split('?')[0];
                const query = url.includes('?') ? url.split('?')[1] : '';
                const cleanQuery = query.replace(/(^|&)api_key=[^&]*/, '');
                
                url = `${PROXY_URL}/3/${cleanPath}?${cleanQuery}&api_key=${API_KEY}`;
            }
            super.open(method, url);
        }
    };

    console.log('[TMDB PROXY] Плагин активирован!');
})();
