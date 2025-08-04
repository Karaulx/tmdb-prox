(function() {
  console.log('TMDB Proxy: Plugin loading...');
  
  // Проверка старого API Lampa
  if (!window.lampa || !lampa.interceptor) {
    console.error('Lampa API not found or incompatible!');
    return;
  }

  // Перехватчик запросов (старый стиль)
  lampa.interceptor.request.add({
    before: function(req) {
      try {
        console.log('[TMDB Proxy] Intercepted:', req.url);
        
        // Пример проксирования:
        // if (req.url.includes('api.themoviedb.org')) {
        //   req.url = req.url.replace('api.themoviedb.org', 'ваш-прокси.сервер');
        // }
        
        return req;
      } catch(e) {
        console.error('[TMDB Proxy] Error:', e);
        return req;
      }
    }
  });

  // Простое уведомление о загрузке
  if (lampa.notice) {
    lampa.notice.show('TMDB Proxy loaded');
  }

  console.log('TMDB Proxy: Ready');
})();
