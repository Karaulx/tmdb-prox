class TMDBProxyPlugin {
  constructor() {
    this.apiProxy = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.imageProxy = 'https://novomih25.duckdns.org:9092/tmdb-image';
    this.init();
  }

  init() {
    if (!window.Lampa) {
      console.error('[TMDB Proxy] Lampa not found!');
      return setTimeout(() => this.init(), 500);
    }

    // Сохраняем оригинальные методы
    this.originalRequest = Lampa.Request;
    this.originalTmdbApi = Lampa.TMDB?.api;
    this.originalTmdbImage = Lampa.TMDB?.image;

    // Полностью перехватываем Request
    Lampa.Request = (url, params) => {
      if (typeof url === 'string') {
        // Полная замена URL для API запросов
        if (url.includes('api.themoviedb.org/3/')) {
          const path = url.split('api.themoviedb.org/3/')[1];
          const proxyUrl = `${this.apiProxy}/${path}`;
          console.log('[TMDB Proxy] Rewriting API URL:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
        // Полная замена URL для изображений
        else if (url.includes('image.tmdb.org')) {
          const path = url.split('image.tmdb.org/')[1];
          const proxyUrl = `${this.imageProxy}/${path}`;
          console.log('[TMDB Proxy] Rewriting Image URL:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
      }
      return this.originalRequest(url, params);
    };

    // Перехватываем TMDB API
    if (Lampa.TMDB?.api) {
      Lampa.TMDB.api = (url, callback, error) => {
        const path = url.includes('api.themoviedb.org/3/') ? 
                   url.split('api.themoviedb.org/3/')[1] : url;
        const proxyUrl = `${this.apiProxy}/${path}`;
        console.log('[TMDB Proxy] Rewriting TMDB.api URL:', url, '→', proxyUrl);
        return this.originalTmdbApi(proxyUrl, callback, error);
      };
    }

    // Перехватываем TMDB Image
    if (Lampa.TMDB?.image) {
      Lampa.TMDB.image = (path, params) => {
        if (!path) return '';
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const proxyUrl = `${this.imageProxy}/${cleanPath}`;
        console.log('[TMDB Proxy] Rewriting TMDB.image:', path, '→', proxyUrl);
        return this.originalTmdbImage(proxyUrl, params);
      };
    }

    console.log('[TMDB Proxy] Plugin successfully initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
