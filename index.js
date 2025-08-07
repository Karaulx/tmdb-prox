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

    // Полный перехват Request
    Lampa.Request = (url, params) => {
      if (typeof url === 'string') {
        if (url.includes('api.themoviedb.org')) {
          // Полностью заменяем URL на прокси
          const path = this.getApiPath(url);
          const proxyUrl = `${this.apiProxy}/${path}`;
          console.log('[TMDB Proxy] Rewriting:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
        if (url.includes('image.tmdb.org')) {
          const path = this.getImagePath(url);
          const proxyUrl = `${this.imageProxy}/${path}`;
          console.log('[TMDB Proxy] Rewriting image:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
      }
      return this.originalRequest(url, params);
    };

    // Перехват TMDB API
    if (Lampa.TMDB?.api) {
      Lampa.TMDB.api = (url, callback, error) => {
        const path = this.getApiPath(url);
        const proxyUrl = `${this.apiProxy}/${path}`;
        console.log('[TMDB Proxy] Rewriting TMDB.api:', url, '→', proxyUrl);
        return this.originalTmdbApi(proxyUrl, callback, error);
      };
    }

    // Перехват TMDB Image
    if (Lampa.TMDB?.image) {
      Lampa.TMDB.image = (path, params) => {
        if (!path) return '';
        const cleanPath = this.getImagePath(path);
        const proxyUrl = `${this.imageProxy}/${cleanPath}`;
        console.log('[TMDB Proxy] Rewriting TMDB.image:', path, '→', proxyUrl);
        return this.originalTmdbImage(proxyUrl, params);
      };
    }

    console.log('[TMDB Proxy] Plugin initialized successfully');
  }

  getApiPath(url) {
    // Извлекаем путь после api.themoviedb.org/3/
    let path = url.replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
                 .replace(/^https?:\/\/[^\/]+\//, '')
                 .replace(/^\/+/, '');
    
    // Удаляем существующий api_key, если есть
    path = path.replace(/(\?|&)api_key=[^&]*/, '');
    
    return path;
  }

  getImagePath(url) {
    return url.replace(/^https?:\/\/image\.tmdb\.org\//, '')
             .replace(/^https?:\/\/[^\/]+\//, '')
             .replace(/^\/+/, '');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
