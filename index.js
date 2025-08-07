class TMDBProxyPlugin {
  constructor() {
    this.proxyBase = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.originalFunctions = {};
    this.init();
  }

  init() {
    if (!window.Lampa?.TMDB) {
      console.error('[TMDB Proxy] Lampa not found!');
      return;
    }

    // Сохраняем оригинальные методы
    this.originalFunctions.tmdbApi = Lampa.TMDB.api;
    this.originalFunctions.tmdbImage = Lampa.TMDB.image;

    // Перехватываем API-запросы
    Lampa.TMDB.api = (url, callback, error) => {
      try {
        // Нормализуем URL (удаляем старый домен и API-ключ)
        let cleanPath = String(url)
          .replace(/^https?:\/\/api\.themoviedb\.org\/?3?\//, '')
          .replace(/(\?|&)api_key=[^&]*/, '');
        
        // Формируем новый URL с прокси
        const proxyUrl = `${this.proxyBase}/${cleanPath}`;
        
        console.debug('[TMDB Proxy] Transformed:', url, '→', proxyUrl);
        return this.originalFunctions.tmdbApi(proxyUrl, callback, error);
      } catch (e) {
        console.error('[TMDB Proxy] Error:', e);
        return this.originalFunctions.tmdbApi(url, callback, error);
      }
    };

    // Перехватываем запросы изображений
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      const cleanPath = String(path).replace(/^https?:\/\/image\.tmdb\.org\//, '');
      return this.originalFunctions.tmdbImage(
        `https://novomih25.duckdns.org:9092/tmdb-image/${cleanPath}`,
        params
      );
    };

    console.log('[TMDB Proxy] Plugin initialized');
  }
}

// Автоматическая инициализация
if (window.Lampa) {
  new TMDBProxyPlugin();
} else {
  document.addEventListener('lampa_start', () => new TMDBProxyPlugin());
}
