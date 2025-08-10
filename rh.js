(function(){
  // Защита от дублирования
  if(window._rh_final_fix) return;
  window._rh_final_fix = true;

  console.log('[RH FINAL] Stage 1: Plugin pre-init');

  // Ждем готовности Lampa
  const waitForLampa = (callback) => {
    if(window.Lampa && window.Lampa.API && window.Lampa.Plugins) {
      console.log('[RH FINAL] Stage 2: Lampa ready');
      callback();
    } else {
      setTimeout(() => waitForLampa(callback), 100);
    }
  };

  waitForLampa(() => {
    console.log('[RH FINAL] Stage 3: Creating source');
    
    // Создаем источник
    const RhSource = {
      name: "RH Source",
      id: "rh_final_source", // Уникальный ID
      type: "universal",
      version: "3.1",
      priority: 1, // Высокий приоритет
      
      // Метод поиска
      search: function(query, tmdb_id, callback) {
        console.log('[RH FINAL] Searching:', query, tmdb_id);
        
        // Тестовые данные (замените на реальный запрос к API)
        const testData = [{
          title: query + " [RH]",
          url: "https://example.com/video.mp4?tmdb=" + tmdb_id,
          quality: "1080p",
          translation: "оригинал",
          type: "video",
          tmdb_id: tmdb_id
        }];
        
        console.log('[RH FINAL] Returning test data');
        callback(testData);
      }
    };

    // Регистрация
    try {
      window.Lampa.Plugins.push(RhSource);
      console.log('[RH FINAL] Stage 4: Registration complete');
      
      // Принудительное обновление кеша плагинов
      if(window.Lampa.API.pluginUpdate) {
        window.Lampa.API.pluginUpdate();
      }
    } catch(e) {
      console.error('[RH FINAL] Registration error:', e);
    }
  });
})();
