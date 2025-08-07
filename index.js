TMDBProxyPlugin {
  constructor() {
    this.proxyBase = 'https://novomih25.duckdns.org:9092/tmdb-api';
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

    // Перехват всех запросов через Lampa.Request
    Lampa.Request = (url, params) => {
      if (typeof url === 'string' && url.includes('themoviedb.org')) {
        const cleanUrl = url
          .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
          .replace(/(\?|&)api_key=[^&]*/, '');
        
        const proxyUrl = `${this.proxyBase}/${cleanUrl}`;
        console.debug('[TMDB Proxy] Transformed:', url, '→', proxyUrl);
        return this.originalRequest(proxyUrl, params);
      }
      return this.originalRequest(url, params);
    };

    // Перехват изображений
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      const cleanPath = String(path).replace(/^https?:\/\/image\.tmdb\.org\//, '');
      return this.originalApi(`https://novomih25.duckdns.org:9092/tmdb-image/${cleanPath}`, params);
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
