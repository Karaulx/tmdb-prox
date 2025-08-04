(function() {
  // Проверяем, загружен ли основной API Lampa
  if (!window.lampa) {
    console.error('Lampa API not found!');
    return;
  }

  console.log('TMDB Proxy: Plugin loading...');

  // Добавляем плагин в систему
  Lampa.Plugin.add({
    id: 'tmdb_proxy',
    name: 'TMDB Proxy',
    version: '1.0',
    component: true,
    standalone: false,
    frontend: function() {
      // Ваш основной код
      console.log('TMDB Proxy: Frontend loaded');

      // Перехватчик запросов
      if (lampa.interceptor) {
        lampa.interceptor.request.add({
          before: function(req) {
            console.log('Intercepted request:', req.url);
            // Здесь можно модифицировать запрос
            return req;
          }
        });
      }
    }
  });

  console.log('TMDB Proxy: Plugin registered');
})();
