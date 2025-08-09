(function() {
    console.log('[RH] Safe plugin initialization');
    
    // Не трогаем глобальные объекты Lampa
    if (!window._rhPluginLoaded) {
        window._rhPluginLoaded = true;
        
        function registerPlugin() {
            if (!window.Lampa || !window.Lampa.Plugins) {
                console.log('[RH] Lampa not ready, waiting...');
                setTimeout(registerPlugin, 100);
                return;
            }
            
            console.log('[RH] Registering plugin safely');
            
            window.Lampa.Plugins.push({
                name: "RH Source",
                id: "rh_source",
                type: "series",
                version: "1.1",
                
                search: function(query, tmdb_id, callback) {
                    console.log('[RH] Search:', query, tmdb_id);
                    
                    // Ваш код API
                    fetch(`https://api4.rhhhhhhh.live/search?tmdb_id=${tmdb_id}`)
                        .then(r => r.json())
                        .then(data => callback(data || []))
                        .catch(e => {
                            console.error('[RH] Error:', e);
                            callback([]);
                        });
                }
            });
        }
        
        registerPlugin();
    }
})();
