class TMDBProxyPlugin {
  constructor() {
    this.proxyDomain = 'https://novomih25.duckdns.org:9092';
    this.originalFunctions = {};
  }

  init() {
    // Сохраняем оригинальные функции
    this.originalFunctions.tmdbApi = Lampa.TMDB.api;
    this.originalFunctions.tmdbImage = Lampa.TMDB.image;

    // Перехватываем API запросы
    Lampa.TMDB.api = (url, callback, error) => {
      const cleanUrl = url.replace('https://api.themoviedb.org/3', '');
      const proxyUrl = `${this.proxyDomain}/tmdb-api${cleanUrl}`;
      return this.originalFunctions.tmdbApi(proxyUrl, callback, error);
    };

    // Перехватываем запросы изображений
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      return this.originalFunctions.tmdbImage(`${this.proxyDomain}/tmdb-image${path}`, params);
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
