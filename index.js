class TMDBProxyPlugin {
  constructor() {
    this.proxyDomain = 'https://novomih25.duckdns.org:9092';
  }

  init() {
    const originalApi = Lampa.TMDB.api;
    const originalImage = Lampa.TMDB.image;

    // Перехват API запросов
    Lampa.TMDB.api = (url, callback, error) => {
      const cleanUrl = url.toString()
        .replace('https://api.themoviedb.org/3', '')
        .replace(/^https?:\/\/[^\/]+/, '');
      
      const proxyUrl = `${this.proxyDomain}/tmdb-api${cleanUrl}`;
      console.log('[TMDB Proxy] Proxying:', url, '→', proxyUrl);
      
      return originalApi(proxyUrl, callback, error);
    };

    // Перехват запросов изображений
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      return originalImage(`${this.proxyDomain}/tmdb-image${path}`, params);
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
