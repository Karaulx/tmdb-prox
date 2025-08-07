class TMDBProxyPlugin {
  constructor() {
    this.apiProxy = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.imageProxy = 'https://novomih25.duckdns.org:9092/tmdb-image';
    this.apiKey = 'a68d078b1475b51c18e6d4d0f44600f8'; // Ваш API ключ
    this.init();
  }

  init() {
    if (!window.Lampa) {
      console.error('[TMDB Proxy] Lampa not found!');
      return setTimeout(() => this.init(), 500);
    }

    // Полностью заменяем TMDB методы
    this.overrideTmdbMethods();
    console.log('[TMDB Proxy] Plugin initialized successfully');
  }

  overrideTmdbMethods() {
    // Перехватываем основной Request метод
    const originalRequest = Lampa.Request;
    Lampa.Request = (url, params) => {
      if (typeof url === 'string') {
        if (url.includes('api.themoviedb.org')) {
          const path = this.getApiPath(url);
          const proxyUrl = `${this.apiProxy}/${path}`;
          console.log('[TMDB Proxy] Rewriting API URL:', url, '→', proxyUrl);
          return originalRequest(proxyUrl, params);
        }
        if (url.includes('image.tmdb.org')) {
          const path = this.getImagePath(url);
          const proxyUrl = `${this.imageProxy}/${path}`;
          console.log('[TMDB Proxy] Rewriting image URL:', url, '→', proxyUrl);
          return originalRequest(proxyUrl, params);
        }
      }
      return originalRequest(url, params);
    };

    // Полностью заменяем TMDB.api
    if (Lampa.TMDB?.api) {
      Lampa.TMDB.api = (url, callback, error) => {
        const path = this.getApiPath(url);
        const proxyUrl = `${this.apiProxy}/${path}`;
        console.log('[TMDB Proxy] TMDB.api:', url, '→', proxyUrl);
        return Lampa.Request(proxyUrl, {
          callback: callback,
          error: error
        });
      };
    }

    // Полностью заменяем TMDB.image
    if (Lampa.TMDB?.image) {
      Lampa.TMDB.image = (path, params) => {
        if (!path) return '';
        const cleanPath = this.getImagePath(path);
        const proxyUrl = `${this.imageProxy}/${cleanPath}`;
        console.log('[TMDB Proxy] TMDB.image:', path, '→', proxyUrl);
        return proxyUrl;
      };
    }
  }

  getApiPath(url) {
    // Извлекаем путь после api.themoviedb.org/3/
    let path = url.replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
                 .replace(/^https?:\/\/[^\/]+\//, '')
                 .replace(/^\/+/, '');
    
    // Удаляем все существующие api_key
    path = path.replace(/(\?|&)api_key=[^&]*/g, '');
    
    // Добавляем наш API ключ
    path += (path.includes('?') ? '&' : '?') + `api_key=${this.apiKey}`;
    
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
