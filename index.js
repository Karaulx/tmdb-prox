class TMDBProxyPlugin {
  constructor(config) {
    this.config = config || {};
    this.proxy_url = this.config.proxy_url || "https://novomih25.duckdns.org:9092";
    this.api_key = this.config.api_key || "a68d078b1475b51c18e6d4d0f44600f8";

    // Перехватываем все запросы Lampa
    this.hijackFetch();
    this.hijackXHR();
    this.overrideImageUrls();
  }

  // Перехват fetch-запросов
  hijackFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      const modifiedUrl = this.modifyRequestUrl(url);
      return originalFetch(modifiedUrl, options);
    };
  }

  // Перехват XMLHttpRequest (если Lampa использует его)
  hijackXHR() {
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
      open(method, url, async) {
        const modifiedUrl = this.modifyRequestUrl(url);
        super.open(method, modifiedUrl, async);
      }
    };
  }

  // Модификация URL перед отправкой
  modifyRequestUrl(url) {
    if (typeof url !== 'string') return url;

    // Если запрос к старому прокси (karaulx.github.io)
    if (url.includes('karaulx.github.io/tmdb-prox')) {
      return url.replace(
        'https://karaulx.github.io/tmdb-prox/',
        `${this.proxy_url}/3/`
      ) + `?api_key=${this.api_key}`;
    }

    // Если запрос к TMDB API
    if (url.includes('api.themoviedb.org/3')) {
      return url.replace(
        'https://api.themoviedb.org/3/',
        `${this.proxy_url}/3/`
      ) + (url.includes('?') ? '&' : '?') + `api_key=${this.api_key}`;
    }

    return url;
  }

  // Переопределение URL изображений TMDB
  overrideImageUrls() {
    if (window.tmdb?.imageUrl) {
      const originalImageUrl = window.tmdb.imageUrl;
      window.tmdb.imageUrl = (path, size = 'original') => {
        if (path.startsWith('http')) return path;
        return `${this.proxy_url}/t/p/${size}${path}`;
      };
    }
  }
}

// Инициализация плагина
lampa.plugins.register({
  name: 'tmdb-proxy-override',
  init: (config) => new TMDBProxyPlugin(config),
});
