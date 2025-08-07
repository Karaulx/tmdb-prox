class TMDBProxyPlugin {
  constructor() {
    this.proxyBase = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.imageProxy = 'https://novomih25.duckdns.org:9092/tmdb-image';
    this.init();
  }

  init() {
    if (!window.Lampa?.TMDB?.api) {
      console.error('[TMDB Proxy] Lampa.TMDB not found!');
      return setTimeout(() => this.init(), 500);
    }

    // Сохраняем оригинальные методы
    this.originalApi = Lampa.TMDB.api;
    this.originalRequest = Lampa.Request;
    this.originalImage = Lampa.TMDB.image;

    // Перехват всех запросов через Lampa.Request
    Lampa.Request = (url, params) => {
      if (typeof url === 'string') {
        if (url.includes('api.themoviedb.org')) {
          const cleanUrl = url
            .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
            .replace(/(\?|&)api_key=[^&]*/, '');
          
          const proxyUrl = `${this.proxyBase}/${cleanUrl}`;
          console.debug('[TMDB Proxy] API Transformed:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
        else if (url.includes('image.tmdb.org')) {
          const cleanPath = url.replace(/^https?:\/\/image\.tmdb\.org\//, '');
          const proxyUrl = `${this.imageProxy}/${cleanPath}`;
          console.debug('[TMDB Proxy] Image Transformed:', url, '→', proxyUrl);
          return this.originalRequest(proxyUrl, params);
        }
      }
      return this.originalRequest(url, params);
    };

    // Перехват TMDB API вызовов
    Lampa.TMDB.api = (url, callback, error) => {
      const cleanUrl = String(url)
        .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
        .replace(/(\?|&)api_key=[^&]*/, '');
      
      const proxyUrl = `${this.proxyBase}/${cleanUrl}`;
      console.debug('[TMDB Proxy] API Call Transformed:', url, '→', proxyUrl);
      return this.originalApi(proxyUrl, callback, error);
    };

    // Перехват изображений (упрощенная версия)
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      
      // Если путь уже полный URL
      if (path.startsWith('http')) {
        if (path.includes('image.tmdb.org')) {
          return path.replace('https://image.tmdb.org', this.imageProxy);
        }
        return path;
      }
      
      // Если относительный путь
      return `${this.imageProxy}/t/p/${params || 'original'}${path}`;
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
