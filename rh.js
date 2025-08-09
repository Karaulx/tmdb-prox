(function(){
    if(window._reyohoho_v2) return;
    window._reyohoho_v2 = true;

    console.log('[REYOHOHO] Initializing enhanced plugin v2');

    // Ожидаем загрузки Lampa
    function waitLampa(callback) {
        if(window.Lampa && window.Lampa.Plugins) callback();
        else setTimeout(() => waitLampa(callback), 100);
    }

    waitLampa(() => {
        console.log('[REYOHOHO] Lampa ready, installing plugin');

        const ReyohohoPlugin = {
            name: "Reyohoho Source",
            id: "reyohoho",
            type: "universal",
            version: "2.0",
            
            // Основной метод для поиска источников
            sources: function(item, callback) {
                console.log('[REYOHOHO] Processing item:', item.title, item.id);
                
                // Подготавливаем параметры запроса
                const params = {
                    q: item.title,
                    tmdb_id: item.id,
                    year: item.year,
                    type: item.type,
                    clean_title: item.title.replace(/[^\w\sа-яА-Я]/gi, '').trim()
                };

                // Запрос к вашему API
                fetch(`https://reyohoho-gitlab.vercel.app/api/search?` + new URLSearchParams(params))
                    .then(response => {
                        if(!response.ok) throw new Error('API error: ' + response.status);
                        return response.json();
                    })
                    .then(data => {
                        // Форматируем ответ для Lampa
                        const sources = Array.isArray(data) ? data.map(source => ({
                            title: source.title || '[REYOHOHO] ' + item.title,
                            url: source.url,
                            quality: source.quality || 'HD',
                            type: source.type || 'video',
                            translation: source.translation || 'оригинал',
                            // Дополнительные метаданные
                            meta: {
                                year: item.year,
                                poster: item.poster,
                                id: item.id
                            }
                        })) : [];

                        console.log('[REYOHOHO] Found sources:', sources.length);
                        callback(sources);
                    })
                    .catch(error => {
                        console.error('[REYOHOHO] Error:', error);
                        callback([]); // Возвращаем пустой массив при ошибке
                    });
            },
            
            // Метод для поиска по списку (если нужен)
            search: function(query, tmdb_id, callback) {
                this.sources({title: query, id: tmdb_id}, callback);
            }
        };

        // Регистрируем плагин
        window.Lampa.Plugins.push(ReyohohoPlugin);
        console.log('[REYOHOHO] Plugin successfully registered');
    });
})();
