class TMDBProxyOverride {
  constructor(config) {
    this.config = config;
    this.proxy_url = config.proxy_url;
    this.api_key = config.api_key;

    // Перехват всех fetch-запросов
    this.hijackFetch();
    
    // Перехват изображений
    this.overrideImagePaths();
  }

  hijackFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      // Перехват API TMDB
      if (typeof url === 'string' && url.includes('api.themoviedb.org/3')) {
        const newUrl = url
          .replace('https://api.themoviedb.org/3/', `${this.proxy_url}/3/`)
          .replace(/(\?|&)api_key=[^&]*/, '') // Удаляем старый ключ
          + (url.includes('?') ? '&' : '?' + `api_key=${this.api_key}`;
        
        return originalFetch(newUrl, options);
      }
      
      return originalFetch(url, options);
    };

    // Для XMLHttpRequest (если Lampa использует его)
    const originalXHR = window.XMLHttpRequest;
    
    window.XMLHttpRequest = class extends originalXHR {
      open(method, url) {
        if (url.includes('api.themoviedb.org/3')) {
          const newUrl = url
            .replace('https://api.themoviedb.org/3/', `${this.proxy_url}/3/`)
            .replace(/(\?|&)api_key=[^&]*/, '')
            + (url.includes('?') ? '&' : '?' + `api_key=${this.api_key}`);
          
          super.open(method, newUrl);
        } else {
          super.open(method, url);
        }
      }
    };
  }

  overrideImagePaths() {
    // Перехват URL изображений TMDB
    if (window.tmdb) {
      const originalImageUrl = window.tmdb.imageUrl;
      
      window.tmdb.imageUrl = (path, size = 'original') => {
        if (path.startsWith('http')) return path; // Уже проксированный URL
        return `${this.proxy_url}/t/p/${size}${path}`;
      };
    }
  }
}

// Инициализация плагина
lampa.plugins.register({
  name: 'tmdb-proxy-override',
  init: (config) => new TMDBProxyOverride(config),
});
