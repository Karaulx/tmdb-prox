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
    const self = this;
    Lampa.Request = function(url, params) {
      if (typeof url === 'string') {
        // Обработка API запросов
        if (url.includes('api.themoviedb.org')) {
          const cleanUrl = self.cleanApiUrl(url);
          const proxyUrl = `${self.apiProxy}/${cleanUrl}`;
          console.log('[TMDB Proxy] API:', url, '→', proxyUrl);
          return self.originalRequest(proxyUrl, params);
        }
        // Обработка изображений
        else if (url.includes('image.tmdb.org')) {
          const cleanPath = self.cleanImageUrl(url);
          const proxyUrl = `${self.imageProxy}/${cleanPath}`;
          console.log('[TMDB Proxy] Image:', url, '→', proxyUrl);
          return self.originalRequest(proxyUrl, params);
        }
      }
      return self.originalRequest(url, params);
    };

    // Перехватываем TMDB API если используется
    if (Lampa.TMDB?.api) {
      Lampa.TMDB.api = function(url, callback, error) {
        const cleanUrl = self.cleanApiUrl(url);
        const proxyUrl = `${self.apiProxy}/${cleanUrl}`;
        console.log('[TMDB Proxy] TMDB.api:', url, '→', proxyUrl);
        return self.originalTmdbApi(proxyUrl, callback, error);
      };
    }

    // Перехватываем TMDB Image если используется
    if (Lampa.TMDB?.image) {
      Lampa.TMDB.image = function(path, params) {
        if (!path) return '';
        const cleanPath = self.cleanImageUrl(path);
        const proxyUrl = `${self.imageProxy}/${cleanPath}`;
        console.log('[TMDB Proxy] TMDB.image:', path, '→', proxyUrl);
        return self.originalTmdbImage(proxyUrl, params);
      };
    }

    console.log('[TMDB Proxy] Plugin fully initialized');
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
