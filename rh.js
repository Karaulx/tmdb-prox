(function(){
    if(window.__rh_tmdb_proxy_final_v2) return;
    window.__rh_tmdb_proxy_final_v2 = true;

    console.log('[RH TMDB PROXY v2] Initializing');

    if(!window._plugins) window._plugins = [];
    
    const plugin = {
        id: "rh_tmdb_proxy_v2",
        name: "RH TMDB Proxy v2", 
        type: "universal",
        priority: 1,
        proxyBase: 'https://novomih25.duckdns.org:9092/tmdb-api',
        
        search: function(query, tmdb_id, callback) {
            console.log(`[RH PROXY] Search: ${query} (${tmdb_id})`);
            
            fetch(`${this.proxyBase}/movie/${tmdb_id}/videos`)
                .then(response => {
                    if(!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    const results = data.results.map(video => ({
                        title: `${query} (${video.type})`,
                        url: this._getVideoUrl(video),
                        quality: video.size > 720 ? '1080p' : '720p',
                        translation: video.iso_3166_1 === 'RU' ? 'русский' : 'оригинал',
                        type: 'video',
                        tmdb_id: tmdb_id,
                        thumb: this._getSafeThumbUrl(video.key) // Исправление для CORS
                    }));
                    
                    callback(results.length ? results : this._getFallback());
                })
                .catch(e => {
                    console.error('[RH PROXY] Error:', e);
                    callback(this._getFallback());
                });
        },
        
        _getVideoUrl: function(video) {
            return video.site === 'YouTube' 
                ? `https://youtube.com/watch?v=${video.key}`
                : `${this.proxyBase}/video/${video.key}`;
        },
        
        _getSafeThumbUrl: function(key) {
            if(!key) return '';
            // Используем прямое обращение к YouTube для миниатюр
            return `https://img.youtube.com/vi/${key}/default.jpg`;
        },
        
        _getFallback: function() {
            return [{
                title: 'Backup Video',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                quality: '1080p',
                type: 'video'
            }];
        },
        
        getMeta: function(tmdb_id) {
            return fetch(`${this.proxyBase}/movie/${tmdb_id}`)
                .then(r => r.json())
                .then(data => ({
                    ...data,
                    // Исправление для изображений
                    poster_path: data.poster_path 
                        ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
                        : '',
                    backdrop_path: data.backdrop_path 
                        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` 
                        : ''
                }));
        }
    };

    window._plugins.push(plugin);
    console.log('[RH PROXY] Plugin v2 registered');
})();
