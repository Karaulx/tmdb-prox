(function(){
    if(window._rh_plugin_loaded) return;
    window._rh_plugin_loaded = true;

    console.log('[RH] Plugin initialization started');

    const waitLampa = (callback) => {
        if(window.Lampa && window.Lampa.API && window.Lampa.Plugins) {
            console.log('[RH] Lampa API ready');
            callback();
        }
        else setTimeout(() => waitLampa(callback), 100);
    };

    waitLampa(() => {
        console.log('[RH] Registering source');
        
        const RhSource = {
            name: "RH Source",
            id: "rh_source",
            version: "3.1",
            type: "movie", // или "series" или "universal"
            priority: 1,
            
            // Обязательные методы
            search: function(query, tmdb_id, callback) {
                console.log('[RH] Search request:', {query, tmdb_id});
                
                // Пример реального запроса к API
                fetch(`https://api4.rhhhhhhh.live/search?q=${encodeURIComponent(query)}&tmdb_id=${tmdb_id}`)
                    .then(r => r.json())
                    .then(data => {
                        // Преобразование данных в формат Lampa
                        const results = data.map(item => ({
                            title: item.title || query,
                            url: item.url, // Обязательное поле
                            quality: item.quality || '1080p',
                            translation: item.translation || 'оригинал',
                            type: 'video', // или 'torrent'
                            tmdb_id: tmdb_id
                        }));
                        
                        console.log('[RH] Search results:', results);
                        callback(results);
                    })
                    .catch(e => {
                        console.error('[RH] Search error:', e);
                        callback([]);
                    });
            },
            
            // Для совместимости с новыми версиями Lampa
            sources: function(item, callback) {
                this.search(item.title, item.id, callback);
            }
        };

        // Регистрация плагина
        try {
            window.Lampa.Plugins.push(RhSource);
            console.log('[RH] Source registered successfully');
            
            // Принудительное обновление кеша
            if(window.Lampa.API.pluginUpdate) {
                window.Lampa.API.pluginUpdate();
                console.log('[RH] Plugins cache updated');
            }
            
            // Дополнительная проверка через 3 секунды
            setTimeout(() => {
                const found = window.Lampa.Plugins.find(p => p.id === 'rh_source');
                console.log('[RH] Verification:', found ? 'Source found' : 'Source NOT found');
            }, 3000);
        }
        catch(e) {
            console.error('[RH] Registration failed:', e);
        }
    });
})();
