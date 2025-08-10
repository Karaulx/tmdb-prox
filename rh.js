(function(){
    // Защита от дублирования
    if(window._rh_plugin_v3_loaded) return;
    window._rh_plugin_v3_loaded = true;

    console.log('[RHv3] Plugin initialization started');

    const waitLampa = (callback) => {
        if(window.Lampa && window.Lampa.API && window.Lampa.Plugin) {
            console.log('[RHv3] Lampa API ready');
            callback();
        }
        else {
            console.log('[RHv3] Waiting for Lampa...');
            setTimeout(() => waitLampa(callback), 100);
        }
    };

    waitLampa(() => {
        console.log('[RHv3] Registering source');
        
        class RhSource {
            constructor(){
                this.name = "RH Source";
                this.id = "rh_source_v3";
                this.version = "3.3";
                this.type = "universal"; // Работает для фильмов и сериалов
                this.priority = 1;
            }
            
            search(query, tmdb_id, callback) {
                console.log('[RHv3] Search request:', {query, tmdb_id});
                
                // Реальный запрос к API
                fetch(`https://api4.rhhhhhhh.live/get_movie?tmdb_id=${tmdb_id}`)
                    .then(response => response.json())
                    .then(data => {
                        const results = data.links.map(item => ({
                            title: item.title || query,
                            url: item.url, // Прямая ссылка на видео
                            quality: item.quality || '1080p',
                            translation: item.translation || 'оригинал',
                            type: 'video',
                            tmdb_id: tmdb_id
                        }));
                        callback(results);
                    })
                    .catch(e => {
                        console.error('[RHv3] API error:', e);
                        callback([]); // Возвращаем пустой массив при ошибке
                    });
            }
            
            sources(item, callback) {
                this.search(item.title, item.id, callback);
            }
        }

        // Регистрация плагина
        try {
            const plugin = new RhSource();
            Lampa.Plugin.add(plugin);
            console.log('[RHv3] Source registered successfully');
            
            // Принудительное обновление кеша
            if(Lampa.API.pluginUpdate) Lampa.API.pluginUpdate();
            
            // Проверка через 3 секунды
            setTimeout(() => {
                const found = Lampa.Plugin.list().find(p => p.id === 'rh_source_v3');
                console.log('[RHv3] Verification:', found ? 'SUCCESS' : 'FAILED');
                if(found) {
                    // Тестовый поиск
                    found.search('Test', 123, (results) => {
                        console.log('[RHv3] Test search results:', results);
                    });
                }
            }, 3000);
        }
        catch(e) {
            console.error('[RHv3] Registration failed:', e);
        }
    });
})();
