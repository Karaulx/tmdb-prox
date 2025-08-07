class TMDBProxyPlugin {
  constructor() {
    this.proxyDomain = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.originalFunctions = {};
    this.init();
  }

  init() {
    if (!window.Lampa?.TMDB) {
      console.error('[TMDB Proxy] Lampa or TMDB object not found!');
      return;
    }

    this.originalFunctions.tmdbApi = Lampa.TMDB.api;
    this.originalFunctions.tmdbImage = Lampa.TMDB.image;

    Lampa.TMDB.api = (url, callback, error) => {
      try {
        // Извлекаем путь после /3/ или просто путь
        let apiPath = String(url).replace(/^https?:\/\/api\.themoviedb\.org(\/3)?\//, '');
        
        // Удаляем существующий api_key если есть
        apiPath = apiPath.replace(/(\?|&)api_key=[^&]*/, '');
        
        // Формируем новый URL без дублирования доменов
        const proxyUrl = `${this.proxyDomain}/${apiPath}`;
        
        console.log('[TMDB Proxy] Transformed URL:', {original: url, proxied: proxyUrl});
        
        return this.originalFunctions.tmdbApi(proxyUrl, callback, error);
      } catch (e) {
        console.error('[TMDB Proxy] Error:', e);
        return this.originalFunctions.tmdbApi(url, callback, error);
      }
    };

    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      return this.originalFunctions.tmdbImage(
        `https://novomih25.duckdns.org:9092/tmdb-image/${path.replace(/^https?:\/\/image\.tmdb\.org\//, '')}`,
        params
      );
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Инициализация после загрузки Lampa
if (window.Lampa) {
  new TMDBProxyPlugin();
} else {
  document.addEventListener('lampa_start', () => new TMDBProxyPlugin());
}
