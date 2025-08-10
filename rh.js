(function(){
    // Защита от дублирования
    if(window._rh_custom_plugin) return;
    window._rh_custom_plugin = true;

    console.log('[RH CUSTOM] Plugin initialization');

    // Ждем полной загрузки Lampa
    function waitForLampa(callback) {
        if(window.Lampa && window.Lampa.Plugins) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(() => {
        console.log('[RH CUSTOM] Lampa ready');

        // Создаем кастомный источник
        const CustomSource = {
            name: "Ваш сайт", // Название, которое будет отображаться
            id: "your_site_source",
            type: "movie", // Может быть "movie" или "tv"
            version: "1.0",

            // Основной метод для загрузки контента
            sources: function(item, callback) {
                console.log('[RH CUSTOM] Loading for:', item.title);

                // Формируем запрос к вашему API
                const apiUrl = new URL('https://reyohoho-gitlab.vercel.app/api/search');
                apiUrl.searchParams.set('q', item.title);
                apiUrl.searchParams.set('tmdb_id', item.id);
                apiUrl.searchParams.set('year', item.year || '');

                fetch(apiUrl)
                    .then(response => {
                        if(!response.ok) throw new Error('HTTP ' + response.status);
                        return response.json();
                    })
                    .then(data => {
                        // Форматируем ответ для Lampa
                        const sources = Array.isArray(data) ? data.map(source => ({
                            title: source.title || item.title,
                            file: source.url,
                            quality: source.quality || 'HD',
                            // Дополнительные параметры для отображения
                            provider: 'Ваш сайт', // Будет показан в интерфейсе
                            external: {
                                name: 'Ваш сайт',
                                link: 'https://reyohoho-gitlab.vercel.app' // Ссылка на ваш сайт
                            }
                        })) : [];

                        console.log('[RH CUSTOM] Found sources:', sources.length);
                        callback(sources);
                    })
                    .catch(error => {
                        console.error('[RH CUSTOM] Error:', error);
                        callback([]);
                    });
            },

            // Метод для отображения в интерфейсе
            display: {
                name: "Ваш сайт",
                icon: "https://reyohoho-gitlab.vercel.app/favicon.ico" // Иконка для отображения
            }
        };

        // Регистрируем источник
        try {
            // Для новых версий Lampa
            if(window.Lampa.Plugins.register) {
                window.Lampa.Plugins.register(CustomSource);
            } 
            // Для старых версий
            else if(Array.isArray(window.Lampa.Plugins)) {
                window.Lampa.Plugins.push(CustomSource);
            }
            // Экстренный fallback
            else {
                window.Lampa.Plugins = [CustomSource];
            }

            console.log('[RH CUSTOM] Source registered successfully');
        } catch(e) {
            console.error('[RH CUSTOM] Registration error:', e);
        }
    });
})();
