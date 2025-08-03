(function() {
  if (!window.lampa) return setTimeout(arguments.callee, 100);

  const settings = lampa.storage.get('tmdb-proxy-connector') || {};

  function applyProxy(url) {
    if (!settings.proxyBaseUrl) return url;
    
    // Проксируем только запросы к TMDB API
    if (url.includes('api.themoviedb.org/3')) {
      const newUrl = url.replace(
        'https://api.themoviedb.org/3', 
        settings.proxyBaseUrl + '/3'
      );
      
      console.log('[TMDB Proxy]', url, '->', newUrl);
      return newUrl;
    }
    
    // Проксируем запросы к изображениям
    if (url.includes('image.tmdb.org/t/p/')) {
      return url.replace(
        'https://image.tmdb.org/t/p/',
        settings.proxyBaseUrl + '/t/p/'
      );
    }
    
    return url;
  }

  // Перехватчик запросов
  lampa.request.interceptor.add({
    beforeRequest: function(options) {
      try {
        options.url = applyProxy(options.url);
        
        if (settings.authEnabled && settings.username) {
          options.headers = options.headers || {};
          options.headers['Authorization'] = 'Basic ' + btoa(
            settings.username + ':' + settings.password
          );
        }
      } catch (e) {
        console.error('[TMDB Proxy] Error:', e);
      }
      return options;
    }
  });

  // Обновляем настройки при их изменении
  lampa.settings.listener.follow('tmdb-proxy-connector', (newSettings) => {
    settings = newSettings;
  });
})();
