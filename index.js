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

    // Исправленный перехват изображений
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      
      // Если URL уже проксированный - возвращаем как есть
      if (path.includes(this.imageProxy)) return path;
      
      // Определяем размер изображения
      const size = params || 'original';
      
      // Обработка полного URL TMDB
      if (path.includes('image.tmdb.org')) {
        return path.replace('https://image.tmdb.org', `${this.imageProxy}/${size}`);
      }
      
      // Обработка относительного пути (удаляем дублирующиеся /t/p/)
      const cleanPath = path.replace(/^\/t\/p\/[^\/]+\//, '').replace(/^\//, '');
      
      return `${this.imageProxy}/${size}/${cleanPath}`;
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
