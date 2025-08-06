class TMDBProxyPlugin {
  constructor() {
    this.name = 'TMDB Proxy Plugin';
    this.version = '1.0.3';
    this.proxyDomain = 'https://novomih25.duckdns.org:9092';
    this.originalFunctions = {};
  }

  init() {
    this.saveOriginalFunctions();
    this.interceptAPIRequests();
    this.interceptImageRequests();
    console.log('[TMDB Proxy Plugin] Initialized');
  }

  saveOriginalFunctions() {
    this.originalFunctions.tmdbApi = Lampa.TMDB.api;
    this.originalFunctions.tmdbImage = Lampa.TMDB.image;
  }

  interceptAPIRequests() {
    Lampa.TMDB.api = (originalUrl, callback, error) => {
      // Полностью заменяем URL, а не вкладываем прокси в оригинальный
      const tmdbPath = originalUrl.replace(/^https?:\/\/api\.themoviedb\.org\/?3?\/?/, '');
      const proxyUrl = `${this.proxyDomain}/tmdb-api/${tmdbPath.replace(/^\//, '')}`;
      
      console.log(`[TMDB Proxy] Transforming: ${originalUrl} -> ${proxyUrl}`);
      
      return this.originalFunctions.tmdbApi(proxyUrl, callback, error);
    };
  }

  interceptImageRequests() {
    Lampa.TMDB.image = (path, params = {}) => {
      if (!path) return '';
      const proxyPath = `${this.proxyDomain}/tmdb-image${path}`;
      return this.originalFunctions.tmdbImage(proxyPath, params);
    };
  }
}

// Автоматическая инициализация
if (window.Lampa && window.Lampa.TMDB) {
  new TMDBProxyPlugin().init();
} else {
  const interval = setInterval(() => {
    if (window.Lampa && window.Lampa.TMDB) {
      clearInterval(interval);
      new TMDBProxyPlugin().init();
    }
  }, 500);
}
