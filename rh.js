(function(){
    if(window.__rh_tmdb_proxy_final) return;
    window.__rh_tmdb_proxy_final = true;

    console.log('[RH TMDB PROXY] Initializing with custom proxies');

    // 1. Регистрация плагина
    if(!window._plugins) window._plugins = [];
    
    const config = {
        id: "rh_tmdb_proxy_final",
        name: "RH TMDB Proxy", 
        type: "universal",
        priority: 1,
        proxyBase: 'https://novomih25.duckdns.org:9092/tmdb-api',
        imageProxy: 'https://novomih25.duckdns.org:9092/tmdb-image',
        
        // 2. Основной метод поиска
        search: function(query, tmdb_id, callback) {
            console.log(`[RH PROXY] Searching ${query} (TMDB: ${tmdb_id})`);
            
            // 3. Запрос к вашему прокси
            fetch(`${this.proxyBase}/movie/${tmdb_id}/videos`)
                .then(response => {
                    if(!response.ok) throw new Error('Invalid response');
                    return response.json();
                })
                .then(data => {
                    // 4. Форматируем результаты
                    const results = data.results.map(video => ({
                        title: `${query} (${video.type || 'video'})`,
                        url: this._getVideoUrl(video), // Используем прокси
                        quality: this._getQuality(video),
                        translation: 'оригинал',
                        type: 'video',
                        tmdb_id: tmdb_id,
                        thumb: video.key ? `${this.imageProxy}/youtube/${video.key}.jpg` : ''
                    }));
                    
                    console.log('[RH PROXY] Results:', results);
                    callback(results.length > 0 ? results : this._getFallback(query, tmdb_id));
                })
                .catch(e => {
                    console.error('[RH PROXY] Error:', e);
                    callback(this._getFallback(query, tmdb_id));
                });
        },
        
        // 5. Вспомогательные методы
        _getVideoUrl: function(video) {
            // Если это YouTube видео
            if(video.site === 'YouTube') {
                return `https://youtube.com/watch?v=${video.key}`;
            }
            // Другие типы видео
            return `${this.proxyBase}/video/${video.key}`;
        },
        
        _getQuality: function(video) {
            return video.size > 720 ? '1080p' : '720p';
        },
        
        _getFallback: function(query, tmdb_id) {
            return [{
                title: `${query} [BACKUP]`,
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                quality: '1080p',
                type: 'video',
                tmdb_id: tmdb_id
            }];
        },
        
        // 6. Метод для карточек
        getMeta: function(tmdb_id) {
            return fetch(`${this.proxyBase}/movie/${tmdb_id}`)
                .then(r => r.json());
        }
    };

    window._plugins.push(config);
    console.log('[RH TMDB PROXY] Plugin successfully registered');
})();
