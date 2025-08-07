class TMDBProxyPlugin {
  constructor() {
    this.proxyBase = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.originalFunctions = {};
    this.init();
  }

  init() {
    if (!window.Lampa?.TMDB) {
      console.error('[TMDB Proxy] Lampa not found!');
      return setTimeout(() => this.init(), 500);
    }

    // 1. Перехват API-запросов
    this.originalFunctions.tmdbApi = Lampa.TMDB.api;
    Lampa.TMDB.api = (url, callback, error) => {
      const cleanUrl = String(url)
        .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
        .replace(/(\?|&)api_key=[^&]*/, '');
      
      const proxyUrl = `${this.proxyBase}/${cleanUrl}`;
      console.log('[TMDB Proxy] Transformed:', url, '→', proxyUrl);
      
      return this.originalFunctions.tmdbApi(proxyUrl, callback, error);
    };

    // 2. Перехват изображений
    this.originalFunctions.tmdbImage = Lampa.TMDB.image;
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      const cleanPath = String(path).replace(/^https?:\/\/image\.tmdb\.org\//, '');
      return this.originalFunctions.tmdbImage(
        `https://novomih25.duckdns.org:9092/tmdb-image/${cleanPath}`,
        params
      );
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автозагрузка
if (window.Lampa) {
  new TMDBProxyPlugin();
} else {
  document.addEventListener('lampa_start', () => new TMDBProxyPlugin());
}
