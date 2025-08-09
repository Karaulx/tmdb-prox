(function(){
  // Защита от повторной инициализации
  if(window._rh_plugin_v4) return;
  window._rh_plugin_v4 = true;

  console.log('[RH] Initializing enhanced plugin v4');

  // Ждем готовности Lampa
  const init = () => {
    if(!window.Lampa || !window.Lampa.TMDB) return setTimeout(init, 100);
    
    // Сохраняем оригинальные методы TMDB
    const originalMethods = {
      getMovie: window.Lampa.TMDB.getMovie,
      getTv: window.Lampa.TMDB.getTv
    };

    // Перехватываем запросы к TMDB
    window.Lampa.TMDB.getMovie = async (id) => {
      const data = await originalMethods.getMovie(id);
      await enhanceWithRhData(data, 'movie');
      return data;
    };

    window.Lampa.TMDB.getTv = async (id) => {
      const data = await originalMethods.getTv(id);
      await enhanceWithRhData(data, 'tv');
      return data;
    };

    console.log('[RH] TMDB hooks successfully installed');
  };

  // Дополняем данные результатами из вашего API
  const enhanceWithRhData = async (tmdbData, type) => {
    try {
      // Получаем чистый title/name без спецсимволов
      const cleanTitle = (tmdbData.title || tmdbData.name)
        .replace(/[^\w\s]/gi, '')
        .trim();
      
      // Запрос к вашему API
      const response = await fetch(`https://api4.rhhhhhhh.live/search?` + new URLSearchParams({
        type: type,
        title: cleanTitle,
        year: tmdbData.release_date?.split('-')[0] || '',
        tmdb_id: tmdbData.id
      }));

      if(response.ok) {
        const rhData = await response.json();
        
        // Добавляем источники в объект TMDB
        if(rhData.sources?.length) {
          tmdbData.external_sources = rhData.sources.map(source => ({
            title: source.title || `${cleanTitle} [RH]`,
            url: source.url,
            quality: source.quality || 'HD',
            type: 'external'
          }));
          
          console.log(`[RH] Added ${rhData.sources.length} sources for ${cleanTitle}`);
        }
      }
    } catch(e) {
      console.error('[RH] Enhancement error:', e);
    }
  };

  init();
})();
