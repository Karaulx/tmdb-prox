(function() {
  console.log('TMDB Proxy: Plugin started');
  
  // Проверка API Lampa 1.12.2
  if (!window.lampa || !lampa.interceptor || !lampa.notice) {
    console.error('Lampa 1.12.2 API not found!');
    return;
  }

  // Простое уведомление
  lampa.notice.show('TMDB Proxy loaded');
  
  // Перехватчик запросов
  lampa.interceptor.request.add({
    before: function(req) {
      console.log('Request to:', req.url);
      return req; 
    }
  });
})();
