(function() {
  // Загрузка сохраненных настроек
  var settings = JSON.parse(lampa.storage.get('tmdb_proxy_settings') || '{}');
  
  console.log('TMDB Proxy: Plugin loaded');

  // Функция подмены URL
  function applyProxy(url) {
    try {
      if (!settings.proxy_url) return url;
      
      if (url.includes('api.themoviedb.org/3')) {
        return url.replace('https://api.themoviedb.org/3', settings.proxy_url + '/3');
      }
      
      if (url.includes('image.tmdb.org/t/p/')) {
        return url.replace('https://image.tmdb.org/t/p/', settings.proxy_url + '/t/p/');
      }
      
      return url;
    } catch(e) {
      console.error('Proxy error:', e);
      return url;
    }
  }

  // Перехватчик запросов
  if (lampa.interceptor && lampa.interceptor.request) {
    lampa.interceptor.request.add({
      before: function(request) {
        request.url = applyProxy(request.url);
        return request;
      }
    });
  }

  // Простые настройки
  if (lampa.settings) {
    lampa.settings.add({
      id: 'tmdb_proxy',
      name: 'TMDB Proxy',
      fields: [
        {
          type: 'text',
          id: 'proxy_url',
          name: 'Proxy URL',
          value: settings.proxy_url || 'https://ваш-сервер:9091'
        }
      ],
      onChange: function(newSettings) {
        settings = newSettings;
        lampa.storage.set('tmdb_proxy_settings', JSON.stringify(settings));
      }
    });
  }

  console.log('TMDB Proxy: Initialization complete');
})();
