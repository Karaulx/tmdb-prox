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

    // 1. Перехватываем основной Request метод
    this.originalRequest = Lampa.Request;
    Lampa.Request = (url, params) => {
      if (typeof url === 'string') {
        // Обработка API запросов
        if (url.includes('api.themoviedb.org')) {
          const cleanUrl = url
            .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
            .replace(/(\?|&)api_key=[^&]*/, '');
          const proxyUrl = `${this.apiProxy}/${cleanUrl.replace(/^https?:\/\//, '')}`;
          console.log('[TMDB Proxy] API:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
        // Обработка изображений
        else if (url.includes('image.tmdb.org')) {
          const cleanPath = url
            .replace(/^https?:\/\/image\.tmdb\.org\//, '')
            .replace(/^\/?/, '');
          const proxyUrl = `${this.imageProxy}/${cleanPath.replace(/^https?:\/\//, '')}`;
          console.log('[TMDB Proxy] Image:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
      }
      return this.originalRequest(url, params);
    };

    // 2. Перехватываем TMDB API если используется
    if (Lampa.TMDB?.api) {
      this.originalTmdbApi = Lampa.TMDB.api;
      Lampa.TMDB.api = (url, callback, error) => {
        const cleanUrl = String(url)
          .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
          .replace(/(\?|&)api_key=[^&]*/, '');
        const proxyUrl = `${this.apiProxy}/${cleanUrl.replace(/^https?:\/\//, '')}`;
        console.log('[TMDB Proxy] TMDB.api:', url, '→', proxyUrl);
        return this.originalTmdbApi(proxyUrl, callback, error);
      };
    }

    // 3. Перехватываем TMDB Image если используется
    if (Lampa.TMDB?.image) {
      this.originalTmdbImage = Lampa.TMDB.image;
      Lampa.TMDB.image = (path, params) => {
        if (!path) return '';
        const cleanPath = String(path)
          .replace(/^https?:\/\/image\.tmdb\.org\//, '')
          .replace(/^\/?/, '');
        const proxyUrl = `${this.imageProxy}/${cleanPath.replace(/^https?:\/\//, '')}`;
        console.log('[TMDB Proxy] TMDB.image:', path, '→', proxyUrl);
        return this.originalTmdbImage(proxyUrl, params);
      };
    }

    console.log('[TMDB Proxy] Plugin fully initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
