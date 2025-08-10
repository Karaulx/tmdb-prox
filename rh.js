(function() {
  // Защита от дублирования
  if (window.__reyohoho_plugin_v2) return;
  window.__reyohoho_plugin_v2 = true;

  class ReYohohoProvider {
    constructor() {
      this.name = 'ReYohoho Direct';
      this.id = 'reyohoho_direct';
      this.type = 'plugin';
      this.active = true;
      this.settings = {
        api_url: 'https://api.reyohoho.live/v3'  // Основной API endpoint
      };
    }

    async getUrl(params) {
      try {
        // 1. Получаем TMDB ID из параметров
        const tmdbId = params.tmdb_id;
        if (!tmdbId) {
          console.error('TMDB ID не передан');
          return null;
        }

        // 2. Запрашиваем поток через API
        const streamData = await this.fetchStream(tmdbId, params.type || 'movie');
        
        if (!streamData?.url) {
          console.error('Не удалось получить ссылку на поток');
          return null;
        }

        // 3. Возвращаем данные для плеера
        return {
          url: streamData.url,
          name: this.name,
          title: params.title || 'Фильм',
          quality: streamData.quality || 'auto',
          headers: {
            'Referer': 'https://reyohoho.github.io/',
            'Origin': 'https://reyohoho.github.io'
          }
        };

      } catch (e) {
        console.error('Ошибка в ReYohohoProvider:', e);
        return null;
      }
    }

    async fetchStream(tmdbId, contentType) {
      // Пробуем разные API endpoints
      const endpoints = [
        `${this.settings.api_url}/stream?tmdb_id=${tmdbId}&type=${contentType}`,
        `https://reyohoho-api.vercel.app/play?id=${tmdbId}&source=tmdb`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.url) return data;
          }
        } catch (e) {
          console.log(`Ошибка для ${endpoint}:`, e.message);
        }
      }

      throw new Error('Все API endpoints недоступны');
    }
  }

  // Регистрация провайдера
  const register = () => {
    if (typeof window.plugin_provider === 'function') {
      window.plugin_provider(new ReYohohoProvider());
      console.log('ReYohohoProvider успешно зарегистрирован');
    } else {
      console.warn('Lampa API не доступно');
    }
  };

  // Автоматическая регистрация
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register);
  }
})();
