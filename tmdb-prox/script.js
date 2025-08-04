(function() {
  console.log('TMDB Proxy: Plugin initialized');
  
  // Проверка API Lampa
  if (!window.lampa || !lampa.interceptor || !lampa.interceptor.request) {
    console.error('Lampa API not found or incomplete!');
    return;
  }

  // Перехватчик запросов
  lampa.interceptor.request.add({
    before: function(request) {
      try {
        console.log('Intercepted request to:', request.url);
        
        // Можно модифицировать запрос здесь
        // request.url = request.url.replace('api.themoviedb.org', 'your-proxy.com');
        
        return request;
      } catch(e) {
        console.error('Interceptor error:', e);
        return request;
      }
    }
  });

  // Уведомление о загрузке
  if (lampa.notice) {
    lampa.notice.show('TMDB Proxy loaded');
  }
})();
