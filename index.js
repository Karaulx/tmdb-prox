class TMDBProxyPlugin {
  constructor() {
    this.apiProxy = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.imageProxy = 'https://novomih25.duckdns.org:9092/tmdb-image';
    this.init();
  }

  init() {
    if (!window.Lampa?.TMDB) {
      console.error('[TMDB Proxy] Lampa not found!');
      return setTimeout(() => this.init(), 500);
    }

    // 1. Перехват API запросов
    const originalApi = Lampa.TMDB.api;
    Lampa.TMDB.api = function(url, callback, error) {
      const cleanUrl = String(url)
        .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
        .replace(/(\?|&)api_key=[^&]*/, '');
      
      const proxyUrl = `${this.apiProxy}/${cleanUrl}`;
      console.log('[TMDB Proxy] API:', url, '→', proxyUrl);
      return originalApi(proxyUrl, callback, error);
    }.bind(this);

    // 2. Перехват изображений (полностью переписанный)
    const originalImage = Lampa.TMDB.image;
    Lampa.TMDB.image = function(path, params) {
      if (!path) return '';
      
      // Оставляем только последнюю часть пути
      const imagePath = path.split('/').pop();
      const proxyUrl = `${this.imageProxy}/t/p/${params?.size || 'original'}${imagePath ? '/' + imagePath : ''}`;
      
      console.log('[TMDB Proxy] Image:', path, '→', proxyUrl);
      return originalImage(proxyUrl, params);
    }.bind(this);

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автозагрузка
new TMDBProxyPlugin();
