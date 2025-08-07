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
    this.originalTmdbImage = Lampa.TMDB?.image || ((path) => path); // Fallback

    // Перехват всех запросов через Lampa.Request
    Lampa.Request = (url, params) => {
      if (typeof url === 'string') {
        if (url.includes('api.themoviedb.org')) {
          const cleanUrl = url
            .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
            .replace(/(\?|&)api_key=[^&]*/, '');
          return this.originalRequest(`${this.apiProxy}/${cleanUrl}`, params);
        }
        else if (url.includes('image.tmdb.org')) {
          const cleanPath = url.replace(/^https?:\/\/image\.tmdb\.org\//, '');
          return this.originalRequest(`${this.imageProxy}/${cleanPath}`, params);
        }
      }
      return this.originalRequest(url, params);
    };

    // Перехват TMDB API
    if (Lampa.TMDB?.api) {
      Lampa.TMDB.api = (url, callback, error) => {
        const cleanUrl = String(url)
          .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
          .replace(/(\?|&)api_key=[^&]*/, '');
        return this.originalTmdbApi(`${this.apiProxy}/${cleanUrl}`, callback, error);
      };
    }

    // Перехват изображений (исправленная версия)
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      // Если путь уже содержит наш прокси, возвращаем как есть
      if (path.includes(this.imageProxy)) return path;
      
      // Очищаем путь от оригинального домена
      const cleanPath = String(path)
        .replace(/^https?:\/\/image\.tmdb\.org\//, '')
        .replace(/^\/+/, '');
      
      // Возвращаем путь через наш прокси
      return `${this.imageProxy}/${cleanPath}`;
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
