class TMDBProxyPlugin {
  // Добавляем метаданные плагина
  static get meta() {
    return {
      id: 'novomih25-tmdb-proxy',
      name: 'TMDB Proxy',
      version: '1.0.1',
      description: 'Proxy for TMDB API and images optimization',
      author: 'karakulx'
    };
  }

  constructor() {
    this.proxyBase = 'https://novomih25.duckdns.org:9092/tmdb-api';
    this.imageProxy = 'https://novomih25.duckdns.org:9092/tmdb-image';
    this.init();
  }

  init() {
    if (!window.Lampa?.TMDB?.api) {
      console.log(`[${TMDBProxyPlugin.meta.name}] Waiting for Lampa...`);
      return setTimeout(() => this.init(), 500);
    }

    console.log(`[${TMDBProxyPlugin.meta.name}] v${TMDBProxyPlugin.meta.version} started`);

    // Сохраняем оригинальный метод
    this.originalImage = Lampa.TMDB.image || ((path) => path);
    
    // Переопределяем обработку изображений
    Lampa.TMDB.image = (path, params) => {
      if (!path) return '';
      
      const size = this.getOptimalSize(params);
      let url = this.formatUrl(path, size);
      
      this.preloadImage(url);
      return url;
    };
  }

  getOptimalSize(params) {
    if (params) return params;
    return window.innerWidth > 800 ? 'w500' : 'w300';
  }

  formatUrl(path, size) {
    if (path.includes(this.imageProxy)) return path;
    
    // Обработка полных URL
    if (path.includes('image.tmdb.org')) {
      return path.replace('https://image.tmdb.org/t/p/', `${this.imageProxy}/${size}/`);
    }
    
    // Обработка относительных путей
    const cleanPath = path.replace(/^\/?t\/p\/[^\/]+\//, '').replace(/^\//, '');
    return `${this.imageProxy}/${size}/${cleanPath}`;
  }

  preloadImage(url) {
    if (typeof window === 'undefined') return;
    
    try {
      const img = new Image();
      img.src = url;
      
      // Добавляем обработку ошибок загрузки
      img.onerror = () => console.warn(`[${TMDBProxyPlugin.meta.name}] Failed to load image: ${url}`);
    } catch (e) {
      console.error(`[${TMDBProxyPlugin.meta.name}] Preload error:`, e);
    }
  }
}

// Автоматическая инициализация
if (typeof window.Lampa !== 'undefined') {
  new TMDBProxyPlugin();
} else {
  document.addEventListener('lampa-loaded', () => new TMDBProxyPlugin());
}
