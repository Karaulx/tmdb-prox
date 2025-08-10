(function(){
    // Защита от повторного выполнения
    if(window._rh_ultimate_plugin) return;
    window._rh_ultimate_plugin = true;

    console.log('[RH ULTIMATE] Plugin initialization started');

    // Универсальный метод ожидания Lampa
    function waitForLampa(callback, attempts = 0) {
        if(window.Lampa) {
            // Специальная обработка для разных версий Lampa
            if(window.Lampa.Plugins && (Array.isArray(window.Lampa.Plugins) || typeof window.Lampa.Plugins === 'object')) {
                callback();
            } else if(attempts < 10) {
                setTimeout(() => waitForLampa(callback, attempts + 1), 200);
            } else {
                console.error('[RH ULTIMATE] Lampa.Plugins not found or invalid');
            }
        } else if(attempts < 20) {
            setTimeout(() => waitForLampa(callback, attempts + 1), 100);
        } else {
            console.error('[RH ULTIMATE] Lampa not found');
        }
    }

    waitForLampa(() => {
        console.log('[RH ULTIMATE] Lampa ready, creating plugin');

        // Создаем наш плагин
        const RhUltimatePlugin = {
            name: "RH Ultimate Source",
            id: "rh_ultimate",
            type: "universal",
            version: "2.0",
            
            // Универсальный метод поиска
            search: function(query, tmdb_id, callback) {
                console.log('[RH ULTIMATE] Smart search started:', query, tmdb_id);
                
                // Делаем запрос к вашему API
                fetch(`https://reyohoho-gitlab.vercel.app/api/search?` + new URLSearchParams({
                    q: query,
                    tmdb_id: tmdb_id,
                    clean_title: query.replace(/[^\w\sа-яА-Я]/gi, '').trim().toLowerCase()
                }))
                .then(response => {
                    if(!response.ok) throw new Error('API response: ' + response.status);
                    return response.json();
                })
                .then(data => {
                    // Форматируем ответ для Lampa
                    const results = Array.isArray(data) ? data.map(item => ({
                        title: item.title || query,
                        url: item.url,
                        quality: item.quality || 'HD',
                        tmdb_id: tmdb_id,
                        translation: item.translation || 'оригинал',
                        // Дополнительные поля для совместимости
                        file: item.url,
                        quality: item.quality || 'HD',
                        type: 'video'
                    })) : [];

                    console.log('[RH ULTIMATE] Found items:', results.length);
                    callback(results);
                })
                .catch(error => {
                    console.error('[RH ULTIMATE] Search error:', error);
                    callback([]); // Всегда возвращаем массив
                });
            },
            
            // Альтернативный метод для новых версий Lampa
            sources: function(item, callback) {
                this.search(item.title, item.id, callback);
            }
        };

        // Универсальный метод регистрации плагина
        try {
            if(Array.isArray(window.Lampa.Plugins)) {
                // Для старых версий (Lampa.Plugins - массив)
                window.Lampa.Plugins.push(RhUltimatePlugin);
            } else if(typeof window.Lampa.Plugins === 'object') {
                // Для новых версий (Lampa.Plugins - объект)
                window.Lampa.Plugins.register(RhUltimatePlugin);
            } else {
                // Экстренный fallback
                window.Lampa.Plugins = [RhUltimatePlugin];
            }
            console.log('[RH ULTIMATE] Plugin registered successfully');
        } catch(e) {
            console.error('[RH ULTIMATE] Registration failed:', e);
            
            // Последняя попытка
            if(!window.Lampa.Plugins) window.Lampa.Plugins = [];
            window.Lampa.Plugins.push(RhUltimatePlugin);
        }
    });

    // Дополнительный таймаут для самых старых версий
    setTimeout(() => {
        if(!window._rh_ultimate_registered && window.Lampa) {
            console.log('[RH ULTIMATE] Fallback registration');
            if(!window.Lampa.Plugins) window.Lampa.Plugins = [];
            window.Lampa.Plugins.push({
                name: "RH Ultimate Source",
                id: "rh_ultimate",
                search: function(q, id, cb) { cb([]); },
                sources: function(i, cb) { cb({movie: [], tv: []}); }
            });
        }
    }, 3000);
})();
