(function(){
    if(window.__rh_proxy_plugin) return;
    window.__rh_proxy_plugin = true;

    // 1. Регистрация плагина
    if(!window._plugins) window._plugins = [];
    
    const plugin = {
        id: "rh_proxy",
        name: "RH Proxy Source", 
        type: "universal",
        priority: 1,
        
        // 2. Основной метод поиска
        search: function(query, tmdb_id, callback) {
            // 3. Запрос К ВАШЕМУ ПРОКИСЕРВЕРУ
            fetch(`https://ваш-сервер.ru/api/videos?tmdb_id=${tmdb_id}`)
                .then(response => response.json())
                .then(data => {
                    // 4. Преобразование в формат Lampa
                    const results = data.videos.map(video => ({
                        title: video.name || `${query} (${video.quality})`,
                        url: video.url, // Обязательное поле
                        quality: video.quality || 'HD',
                        translation: video.translation || 'оригинал',
                        type: 'video', // или 'torrent'
                        tmdb_id: tmdb_id
                    }));
                    callback(results);
                })
                .catch(e => {
                    console.error('[RH Proxy] Error:', e);
                    callback([]); // Пустой массив при ошибке
                });
        }
    };

    window._plugins.push(plugin);
    console.log('[RH Proxy] Plugin registered');
})();
