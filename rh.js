(function(){
  // Защита от повторной инициализации
  if(window._reyohoho_plugin) return;
  window._reyohoho_plugin = true;

  console.log('[REYOHOHO] Plugin initialization');

  // Основной объект плагина
  const ReyohohoPlugin = {
    metadata: {
      name: "Reyohoho Source",
      id: "reyohoho",
      type: "universal", // Подходит для фильмов и сериалов
      version: "1.0"
    },

    // Метод поиска контента
    async search(query, tmdb_id, callback) {
      try {
        console.log('[REYOHOHO] Searching:', query, tmdb_id);
        
        // Запрос к вашему API
        const response = await fetch(`https://reyohoho-gitlab.vercel.app/api/search?` + new URLSearchParams({
          q: query,
          tmdb_id: tmdb_id,
          clean_title: query.replace(/[^\w\sа-яА-Я]/gi, '').trim()
        }));

        if(!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Форматируем результат для Lampa
        const results = Array.isArray(data) ? data.map(item => ({
          title: item.title || query,
          url: item.url,
          quality: item.quality || 'HD',
          tmdb_id: tmdb_id,
          // Дополнительные поля для лучшего отображения
          translation: item.translation || 'оригинал',
          type: item.type || 'video'
        })) : [];

        console.log(`[REYOHOHO] Found ${results.length} items`);
        callback(results);

      } catch(e) {
        console.error('[REYOHOHO] Search error:', e);
        callback([]); // Возвращаем пустой массив при ошибке
      }
    }
  };

  // Функция регистрации с задержкой
  function register() {
    if(window.Lampa && window.Lampa.Plugins) {
      window.Lampa.Plugins.push(ReyohohoPlugin);
      console.log('[REYOHOHO] Plugin registered successfully');
    } else {
      setTimeout(register, 100);
    }
  }

  // Запускаем регистрацию
  register();
})();
