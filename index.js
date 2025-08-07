class TMDBProxyPlugin {
  constructor() {
    this.proxyBase = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.imageProxy = 'https://novomih25.duckdns.org:9092/tmdb-image';
    this.init();
  }

  init() {
    if (!window.Lampa?.TMDB) {
      console.error('[TMDB Proxy] Lampa not found!');
      return setTimeout(() => this.init(), 500);
    }

    // 1. Перехват API запросов
    this.originalApi = Lampa.TMDB.api;
    Lampa.TMDB.api = (url, callback, error) => {
      const cleanUrl = String(url)
        .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
        .replace(/(\?|&)api_key=[^&]*/, '');
      
      const proxyUrl = `${this.proxyBase}/${cleanUrl}`;
      console.debug('[TMDB Proxy] API:', url, '→', proxyUrl);
      return this.originalApi(proxyUrl, callback, error);
    };

    // 2. Перехват изображений (исправленная версия)
    this.originalImage = Lampa.TMDB.image;
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      
      // Полная очистка URL от оригинального домена
      let cleanPath = String(path)
        .replace(/^https?:\/\/image\.tmdb\.org\//, '')
        .replace(/^\/?/, '');
      
      // Формируем правильный прокси URL
      const proxyUrl = `${this.imageProxy}/${cleanPath}`;
      console.debug('[TMDB Proxy] Image:', path, '→', proxyUrl);
      
      return this.originalImage(proxyUrl, params);
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
