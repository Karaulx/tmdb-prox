(function(){
    if(window._reyohoho_full) return;
    window._reyohoho_full = true;

    console.log('[REYOHOHO] Initializing standalone plugin');

    // Ожидаем загрузки Lampa
    function waitLampa(callback) {
        if(window.Lampa && window.Lampa.Plugins) callback();
        else setTimeout(() => waitLampa(callback), 100);
    }

    waitLampa(() => {
        console.log('[REYOHOHO] Lampa ready, installing plugin');

        const ReyohohoStandalone = {
            name: "Reyohoho (Standalone)",
            id: "reyohoho_standalone",
            type: "universal",
            version: "3.0",
            
            // Полностью заменяем TMDB
            sources: function(item, callback) {
                console.log('[REYOHOHO] Full processing:', item.title, item.id);
                
                const params = {
                    q: item.title,
                    tmdb_id: item.id,
                    year: item.year,
                    type: item.type || (item.seasons ? 'tv' : 'movie'),
                    clean_title: item.title.replace(/[^\w\sа-яА-Я]/gi, '').trim()
                };

                fetch(`https://reyohoho-gitlab.vercel.app/api/full?` + new URLSearchParams(params))
                    .then(response => {
                        if(!response.ok) throw new Error('API error: ' + response.status);
                        return response.json();
                    })
                    .then(data => {
                        const result = {
                            // Основные метаданные
                            meta: {
                                id: item.id,
                                type: params.type,
                                title: item.title,
                                year: item.year,
                                poster: item.poster
                            },
                            // Источники для фильмов
                            movie: Array.isArray(data.movie) ? data.movie.map(source => ({
                                title: source.title || item.title,
                                file: source.url,
                                quality: source.quality || 'HD',
                                translator: source.translation || 'оригинал'
                            })) : [],
                            // Источники для сериалов
                            tv: Array.isArray(data.tv) ? data.tv.map(season => ({
                                season: season.season,
                                episodes: season.episodes.map(episode => ({
                                    episode: episode.episode,
                                    files: episode.files.map(file => ({
                                        title: file.title || `S${season.season}E${episode.episode}`,
                                        file: file.url,
                                        quality: file.quality || 'HD'
                                    }))
                                }))
                            })) : []
                        };

                        console.log('[REYOHOHO] Prepared data:', result);
                        callback(result);
                    })
                    .catch(error => {
                        console.error('[REYOHOHO] Full error:', error);
                        callback({movie: [], tv: []});
                    });
            },
            
            // Метод для поиска (если нужен)
            search: function(query, tmdb_id, callback) {
                this.sources({title: query, id: tmdb_id}, (data) => {
                    callback(data.movie.concat(data.tv));
                });
            }
        };

        // Удаляем все TMDB плагины если есть
        window.Lampa.Plugins = window.Lampa.Plugins.filter(p => !p.id.includes('tmdb'));
        
        // Регистрируем наш плагин
        window.Lampa.Plugins.push(ReyohohoStandalone);
        console.log('[REYOHOHO] Standalone plugin successfully registered');
    });
})();
