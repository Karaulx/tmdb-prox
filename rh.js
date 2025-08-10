(function() {
  // Проверка дублирования
  if (window.__lampa_reyohoho_plugin) return;
  window.__lampa_reyohoho_plugin = true;

  // Основной класс провайдера
  class ReYohohoSource {
    constructor() {
      this.name = 'ReYohoho';
      this.type = 'plugin';
      this.supports = ['movie', 'tv']; // Поддерживаемые типы контента
      this.icons = {
        dark: 'https://reyohoho.github.io/favicon.ico',
        light: 'https://reyohoho.github.io/favicon.ico'
      };
    }

    async getUrl(params) {
      try {
        // Получаем TMDB ID из параметров
        const tmdbId = params.tmdb_id;
        const contentType = params.type || 'movie';

        if (!tmdbId) throw new Error('TMDB ID не найден');

        // Формируем URL для плеера ReYohoho
        const playerUrl = `https://reyohoho.github.io/player.html?tmdb_id=${tmdbId}&type=${contentType}`;

        // Для сериалов добавляем сезон и эпизод
        if (contentType === 'tv') {
          playerUrl += `&season=${params.season || 1}&episode=${params.episode || 1}`;
        }

        return {
          url: playerUrl,
          name: this.name,
          title: params.title,
          external: false // Используем внутренний плеер Lampa
        };

      } catch (e) {
        console.error('ReYohohoSource error:', e);
        return null;
      }
    }
  }

  // Регистрация провайдера
  const registerProvider = () => {
    if (window.plugin_provider) {
      window.plugin_provider(new ReYohohoSource());
      console.log('ReYohoho provider registered');
    } else {
      console.warn('Lampa plugin system not available');
    }
  };

  // Автоматическая регистрация при загрузке
  if (document.readyState === 'complete') {
    registerProvider();
  } else {
    window.addEventListener('load', registerProvider);
  }
})();
