(function() {
    // Конфигурация прокси
    const TMDB_API_URL = "https://api.themoviedb.org/3/";
    const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/";
    const API_KEY = "a68d078b1475b51c18e6d4d0f44600f8"; // Ваш API-ключ

    // 1. Перехват всех запросов Lampa к TMDB API
    if (window.tmdb?.native?.url) {
        window.tmdb.native.url = "https://tmdb-prox.pages.dev/api/";
    }

    // 2. Перехват fetch-запросов
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
        if (typeof url === 'string') {
            // Перенаправляем запросы API через прокси
            if (url.includes('api.themoviedb.org/3')) {
                const path = url.split('api.themoviedb.org/3/')[1];
                url = `https://tmdb-prox.pages.dev/api/${path}?api_key=${API_KEY}`;
            }
            // Перенаправляем запросы изображений
            else if (url.includes('image.tmdb.org/t/p/')) {
                const path = url.split('image.tmdb.org/t/p/')[1];
                url = `https://tmdb-prox.pages.dev/images/${path}`;
            }
        }
        return originalFetch(url, options);
    };

    // 3. Перехват XMLHttpRequest (если Lampa использует его)
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
        open(method, url) {
            if (url.includes('api.themoviedb.org/3')) {
                const path = url.split('api.themoviedb.org/3/')[1];
                url = `https://tmdb-prox.pages.dev/api/${path}?api_key=${API_KEY}`;
            }
            super.open(method, url);
        }
    };

    // 4. Исправляем URL изображений в Lampa
    if (window.tmdb?.imageUrl) {
        const originalImageUrl = window.tmdb.imageUrl;
        window.tmdb.imageUrl = (path, size = 'original') => {
            if (path.startsWith('http')) return path;
            return `https://tmdb-prox.pages.dev/images/${size}${path}`;
        };
    }

    console.log("[TMDB PROXY] Все запросы перенаправлены на tmdb-prox.pages.dev");
})();
