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

    // Перехватываем основной Request метод
    Lampa.Request = (url, params) => {
      if (typeof url === 'string' && url.includes('themoviedb.org')) {
        const proxyUrl = this.getProxyUrl(url);
        console.log('[TMDB Proxy] Request:', url, '→', proxyUrl);
        return this.originalRequest(proxyUrl, params);
      }
      return this.originalRequest(url, params);
    };

    // Перехватываем TMDB API
    if (Lampa.TMDB?.api) {
      Lampa.TMDB.api = (url, callback, error) => {
        const proxyUrl = this.getProxyUrl(url);
        console.log('[TMDB Proxy] TMDB.api:', url, '→', proxyUrl);
        return this.originalTmdbApi(proxyUrl, callback, error);
      };
    }

    console.log('[TMDB Proxy] Plugin fully initialized');
  }

  getProxyUrl(url) {
    // Очищаем URL от оригинального домена и параметров api_key
    let cleanUrl = String(url)
      .replace(/^https?:\/\/api\.themoviedb\.org\/3\//, '')
      .replace(/^https?:\/\/[^\/]+\//, '')
      .replace(/(\?|&)api_key=[^&]*/, '')
      .replace(/^\/+/, '');

    // Удаляем возможные дублирующиеся параметры
    cleanUrl = cleanUrl.replace(/(&language=[^&]*)+/, '$1');

    // Формируем конечный URL
    return `${this.apiProxy}/${cleanUrl}`;
  }
}

// Автозагрузка
new TMDBProxyPlugin();
