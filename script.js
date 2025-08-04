(function() {
  console.log('TMDB Proxy: Plugin loaded!');
  
  if (!window.lampa) {
    console.error('Lampa API not found!');
    return;
  }

  // Простейший перехватчик для теста
  lampa.interceptor.request.add({
    before: function(req) {
      console.log('Request:', req.url);
      return req;
    }
  });
})();
