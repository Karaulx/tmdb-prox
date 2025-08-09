(function(){
  // Безопасная проверка инициализации
  if(window._rh_plugin_installed) return;
  window._rh_plugin_installed = true;

  console.log('[RH] Safe initialization v3');
  
  const originalTmdb = window.Lampa.Plugins.find(p => p.id === 'tmdb');
  
  if(!originalTmdb) {
    console.error('[RH] TMDB plugin not found!');
    return;
  }

  // Клонируем оригинальный TMDB плагин
  const RhPlugin = JSON.parse(JSON.stringify(originalTmdb));
  
  // Модифицируем только нужные параметры
  RhPlugin.id = 'rh_source';
  RhPlugin.name = 'RH Source';
  RhPlugin.version = '2.0';
  
  // Сохраняем оригинальный метод
  const originalSearch = RhPlugin.search;
  
  // Переопределяем поиск
  RhPlugin.search = function(query, tmdb_id, callback) {
    console.log('[RH] Searching:', query);
    
    // Сначала пробуем ваш API
    fetch(`https://api4.rhhhhhhh.live/search?tmdb_id=${tmdb_id}`)
      .then(r => r.ok ? r.json() : originalSearch(query, tmdb_id, callback))
      .then(data => {
        if(data && data.length > 0) {
          console.log('[RH] Found results:', data.length);
          callback(data);
        } 
        else {
          console.log('[RH] Using fallback to TMDB');
          originalSearch(query, tmdb_id, callback);
        }
      });
  };

  // Регистрируем плагин
  window.Lampa.Plugins.push(RhPlugin);
  console.log('[RH] Plugin successfully registered');
})();
