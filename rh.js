(function() {
  // 1. Регистрация плагина
  if (window.__reyohoho_plugin) return;
  window.__reyohoho_plugin = true;

  class ReYohohoProvider {
    constructor() {
      this.name = 'ReYohoho Auto';
      this.type = 'plugin';
      this.active = true;
      this.cache = {};
    }

    async getUrl(params) {
      try {
        const tmdbId = params.tmdb_id;
        if (!tmdbId) throw new Error('TMDB ID не найден');

        // Проверяем кеш
        if (this.cache[tmdbId]) {
          console.log('Используем кешированную ссылку');
          return this.createResponse(this.cache[tmdbId], params.title);
        }

        // Получаем ссылку
        const streamUrl = await this.extractStream(tmdbId);
        if (!streamUrl) throw new Error('Не удалось получить ссылку');

        // Кешируем результат
        this.cache[tmdbId] = streamUrl;
        
        return this.createResponse(streamUrl, params.title);
      } catch (e) {
        console.error('Ошибка ReYohohoProvider:', e);
        return null;
      }
    }

    async extractStream(tmdbId) {
      // Вариант 1: Прямой запрос к API (если известно)
      const apiUrl = https://api.reyohoho.live/stream?tmdb_id=${tmdbId};
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          return data.url; // Предполагаем формат {url: "..."}
        }
      } catch (e) {
        console.log('API не доступен, пробуем парсинг');
      }

      // Вариант 2: Парсинг страницы (требует CORS)
      const pageUrl = https://reyohoho.github.io/reyohoho/movie/${tmdbId};
      try {
        // Используем расширение CORS Unblock
        const html = await (await fetch(pageUrl)).text();
        
        // Ищем HLS или MP4
        const m3u8Match = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
        const mp4Match = html.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
        
        return m3u8Match?.[0] || mp4Match?.[0] || null;
      } catch (e) {
        console.error('Ошибка парсинга:', e);
        return null;
      }
    }

    createResponse(url, title) {
      return {
        url: url,
        name: 'ReYohoho',
        title: title || 'Фильм',
        headers: {
          'Referer': 'https://reyohoho.github.io/',
          'Origin': 'https://reyohoho.github.io'
        }
      };
    }
  }

  // 2. Регистрация провайдера
  const registerProvider = () => {
    if (window.plugin_provider) {
      window.plugin_provider(new ReYohohoProvider());
    } else {
      window.extensions_provider = window.extensions_provider || [];
      window.extensions_provider.push(new ReYohohoProvider());
    }
    console.log('ReYohoho Provider зарегистрирован');
  };

  // 3. Запуск
  if (document.readyState === 'complete') {
    registerProvider();
  } else {
    window.addEventListener('load', registerProvider);
  }
})();
