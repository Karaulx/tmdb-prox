class TMDBUltimateProxy {
  constructor(config) {
    // Конфиг
    this.proxy = config.proxy_url;
    this.key = config.api_key;

    // Агрессивный перехват
    this.hijackFetch();
    this.hijackXHR();
    this.overrideLampaCore();
    this.patchImageLoader();

    console.log("TMDB Ultimate Proxy активирован!");
  }

  // 1. Перехватываем fetch
  hijackFetch() {
    const originalFetch = window.fetch;
    window.fetch = (url, opts) => {
      return originalFetch(this.fixUrl(url), opts);
    };
  }

  // 2. Перехватываем XMLHttpRequest
  hijackXHR() {
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
      open(method, url) {
        super.open(method, this.fixUrl(url));
      }
    };
  }

  // 3. Исправляем URL
  fixUrl(url) {
    if (typeof url !== 'string') return url;

    // Специальный фикс для karaulx.github.io
    if (url.includes('karaulx.github.io/tmdb-prox')) {
      const path = url.split('tmdb-prox/')[1] || '';
      return `${this.proxy}/3/${path}?api_key=${this.key}`;
    }

    // Обычные запросы TMDB
    if (url.includes('api.themoviedb.org')) {
      return url.replace(
        'https://api.themoviedb.org/3/',
        `${this.proxy}/3/?api_key=${this.key}&`
      );
    }

    return url;
  }

  // 4. Переопределяем ядро Lampa
  overrideLampaCore() {
    if (window.tmdb?.request) {
      const original = tmdb.request;
      tmdb.request = (url) => {
        return original(this.fixUrl(url));
      };
    }
  }

  // 5. Исправляем загрузку изображений
  patchImageLoader() {
    if (window.tmdb?.imageUrl) {
      const original = tmdb.imageUrl;
      tmdb.imageUrl = (path, size = 'original') => {
        if (path.startsWith('http')) return path;
        return `${this.proxy}/t/p/${size}${path}`;
      };
    }
  }
}

// Автозапуск
lampa.plugins.register({
  name: 'tmdb-ultimate-proxy',
  init: (config) => new TMDBUltimateProxy(config)
});
