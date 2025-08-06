/**
 * TMDB Proxy Plugin for Lampa v2.4.6
 * Domain: novomih25.duckdns.org
 * Author: Your Name
 * Version: 1.0.0
 */

// Логирование в консоль для отладки
console.log('[TMDB Proxy Plugin] Initializing...');

// Основной класс плагина
class TMDBProxyPlugin {
  constructor() {
    this.name = 'TMDB Proxy Plugin';
    this.version = '1.0.0';
    this.proxyDomain = 'https://novomih25.duckdns.org';
    this.apiKey = ''; // Здесь будет API ключ после инициализации
    this.originalFunctions = {};
    
    console.log(`[TMDB Proxy Plugin] ${this.name} v${this.version} loaded`);
  }

  // Инициализация плагина
  init() {
    console.log('[TMDB Proxy Plugin] Starting initialization...');
    
    try {
      // Сохраняем оригинальные функции для возможного отката
      this.saveOriginalFunctions();
      
      // Перехватываем запросы к API
      this.interceptAPIRequests();
      
      // Перехватываем запросы изображений
      this.interceptImageRequests();
      
      console.log('[TMDB Proxy Plugin] Initialization completed successfully');
    } catch (error) {
      console.error('[TMDB Proxy Plugin] Initialization error:', error);
    }
  }

  // Сохранение оригинальных функций
  saveOriginalFunctions() {
    console.log('[TMDB Proxy Plugin] Saving original functions...');
    
    this.originalFunctions.tmdbApi = Lampa.TMDB.api;
    this.originalFunctions.tmdbImage = Lampa.TMDB.image;
    
    console.log('[TMDB Proxy Plugin] Original functions saved');
  }

  // Перехват API запросов
  interceptAPIRequests() {
    console.log('[TMDB Proxy Plugin] Intercepting API requests...');
    
    Lampa.TMDB.api = (url, callback, error) => {
      console.log(`[TMDB Proxy Plugin] Original API URL: ${url}`);
      
      // Получаем API ключ из URL если его нет
      if (!this.apiKey && url.includes('api_key=')) {
        this.apiKey = url.split('api_key=')[1].split('&')[0];
        console.log(`[TMDB Proxy Plugin] Extracted API key: ${this.apiKey}`);
      }
      
      // Формируем проксированный URL
      const proxyUrl = `${this.proxyDomain}/tmdb-api${url.replace('https://api.themoviedb.org/3', '')}`;
      console.log(`[TMDB Proxy Plugin] Proxied API URL: ${proxyUrl}`);
      
      // Вызываем оригинальную функцию с проксированным URL
      return this.originalFunctions.tmdbApi(proxyUrl, callback, error);
    };
    
    console.log('[TMDB Proxy Plugin] API requests interception complete');
  }

  // Перехват запросов изображений
  interceptImageRequests() {
    console.log('[TMDB Proxy Plugin] Intercepting image requests...');
    
    Lampa.TMDB.image = (path, params = {}) => {
      console.log(`[TMDB Proxy Plugin] Original image path: ${path}`);
      
      if (!path) return '';
      
      // Формируем проксированный URL изображения
      let proxyPath = `${this.proxyDomain}/tmdb-image${path}`;
      console.log(`[TMDB Proxy Plugin] Proxied image URL: ${proxyPath}`);
      
      // Вызываем оригинальную функцию с проксированным путем
      return this.originalFunctions.tmdbImage(proxyPath, params);
    };
    
    console.log('[TMDB Proxy Plugin] Image requests interception complete');
  }
}

// Создаем и инициализируем плагин при загрузке
console.log('[TMDB Proxy Plugin] Creating plugin instance...');
const plugin = new TMDBProxyPlugin();

// Ждем полной загрузки Lampa
if (window.Lampa && window.Lampa.TMDB) {
  console.log('[TMDB Proxy Plugin] Lampa is ready, initializing plugin...');
  plugin.init();
} else {
  console.log('[TMDB Proxy Plugin] Lampa not ready yet, waiting...');
  let checkInterval = setInterval(() => {
    if (window.Lampa && window.Lampa.TMDB) {
      clearInterval(checkInterval);
      console.log('[TMDB Proxy Plugin] Lampa is now ready, initializing plugin...');
      plugin.init();
    }
  }, 500);
}

console.log('[TMDB Proxy Plugin] Plugin script loaded');
