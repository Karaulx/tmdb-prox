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

    // Перехватываем основной Request метод
    Lampa.Request = (url, params) => {
      if (typeof url === 'string') {
        // Полностью заменяем URL на прокси для TMDB API
        if (url.includes('api.themoviedb.org')) {
          const cleanUrl = this.cleanApiUrl(url);
          const proxyUrl = `${this.apiProxy}/${cleanUrl}`;
          console.log('[TMDB Proxy] Rewriting API URL:', url, '→', proxyUrl);
          url = proxyUrl;
        }
        // Полностью заменяем URL на прокси для изображений
        else if (url.includes('image.tmdb.org')) {
          const cleanPath = this.cleanImageUrl(url);
          const proxyUrl = `${this.imageProxy}/${cleanPath}`;
          console.log('[TMDB Proxy] Rewriting Image URL:', url, '→', proxyUrl);
          url = proxyUrl;
        }
      }
      return this.originalRequest(url, params);
    };

    // Перехватываем TMDB API если используется
    if (Lampa.TMDB?.api) {
      Lampa.TMDB.api = (url, callback, error) => {
        const cleanUrl = this.cleanApiUrl(url);
        const proxyUrl = `${this.apiProxy}/${cleanUrl}`;
        console.log('[TMDB Proxy] Rewriting TMDB.api URL:', url, '→', proxyUrl);
        return this.originalTmdbApi(proxyUrl, callback, error);
      };
    }

    // Перехватываем TMDB Image если используется
    if (Lampa.TMDB?.image) {
      Lampa.TMDB.image = (path, params) => {
        if (!path) return '';
        const cleanPath = this.cleanImageUrl(path);
        const proxyUrl = `${this.imageProxy}/${cleanPath}`;
        console.log('[TMDB Proxy] Rewriting TMDB.image URL:', path, '→', proxyUrl);
        return this.originalTmdbImage(proxyUrl, params);
      };
    }

    console.log('[TMDB Proxy] Plugin successfully initialized');
  }

  cleanApiUrl(url) {
    // Удаляем протокол, домен и версию API
    let cleaned = url.replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
                    .replace(/^https?:\/\/[^\/]+\//, '')
                    .replace(/^\/+/, '');
    
    // Удаляем параметр api_key если он есть
    cleaned = cleaned.replace(/(\?|&)api_key=[^&]*/, '');
    
    return cleaned;
  }

  cleanImageUrl(url) {
    // Удаляем протокол и домен
    return url.replace(/^https?:\/\/image\.tmdb\.org\//, '')
             .replace(/^https?:\/\/[^\/]+\//, '')
             .replace(/^\/+/, '');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
