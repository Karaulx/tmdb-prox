class TMDBProxyPlugin {
   // Добавляем метаданные плагина
  static get meta() {
    return {
      id: 'novomih25-tmdb-proxy',
      name: 'TMDB Prox',
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
      return setTimeout(() => this.init(), 500);
    }

    this.originalImage = Lampa.TMDB.image;
    
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
    
    if (path.includes('image.tmdb.org')) {
      return path.replace('https://image.tmdb.org', `${this.imageProxy}/${size}`);
    }
    
    const cleanPath = path.replace(/^\/t\/p\/[^\/]+\//, '').replace(/^\//, '');
    return `${this.imageProxy}/${size}/${cleanPath}`;
  }

  preloadImage(url) {
    if (typeof window === 'undefined') return;
    
    const img = new Image();
    img.src = url;
  }
}

new TMDBProxyPlugin();
