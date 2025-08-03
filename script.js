(function() {
  // Загрузка сохраненных настроек
  var settings = JSON.parse(lampa.storage.get('tmdb_proxy_settings') || '{}');
  
  console.log('TMDB Proxy: loaded settings', settings);

  // Функция подмены URL
  function applyProxy(url) {
    if (!settings.proxyBaseUrl) return url;
    
    // Проксируем API-запросы
    if (url.includes('api.themoviedb.org/3')) {
      return url.replace(
        'https://api.themoviedb.org/3', 
        settings.proxyBaseUrl + '/3'
      );
    }
    
    // Проксируем запросы изображений
    if (url.includes('image.tmdb.org/t/p/')) {
      return url.replace(
        'https://image.tmdb.org/t/p/', 
        settings.proxyBaseUrl + '/t/p/'
      );
    }
    
    return url;
  }

  // Перехватчик запросов
  lampa.interceptor.request.add({
    before: function(request) {
      try {
        request.url = applyProxy(request.url);
        
        // Добавляем авторизацию если включена
        if (settings.authEnabled && settings.username) {
          request.headers = request.headers || {};
          request.headers['Authorization'] = 'Basic ' + btoa(
            settings.username + ':' + settings.password
          );
        }
      } catch(e) {
        console.error('TMDB Proxy error:', e);
      }
      return request;
    }
  });

  // Создаем интерфейс настроек
  lampa.settings.add({
    id: 'tmdb_proxy',
    name: 'TMDB Proxy Settings',
    fields: [
      {
        type: 'text',
        id: 'proxyBaseUrl',
        name: 'Proxy Server URL',
        value: settings.proxyBaseUrl || 'https://ваш-сервер:9091'
      },
      {
        type: 'switch',
        id: 'authEnabled',
        name: 'Enable Authentication',
        value: settings.authEnabled || false
      },
      {
        type: 'text',
        id: 'username',
        name: 'Username',
        value: settings.username || '',
        show: 'authEnabled' // Показываем только при включенной авторизации
      },
      {
        type: 'password',
        id: 'password',
        name: 'Password',
        value: settings.password || '',
        show: 'authEnabled'
      }
    ],
    onChange: function(newSettings) {
      // Сохраняем новые настройки
      settings = newSettings;
      lampa.storage.set('tmdb_proxy_settings', JSON.stringify(settings));
      console.log('TMDB Proxy: settings updated', settings);
    }
  });

  console.log('TMDB Proxy: plugin initialized');
})();
