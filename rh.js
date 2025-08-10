(function(){
    // Защита от дублирования
    if(window._rh_final_plugin) return;
    window._rh_final_plugin = true;

    console.log('[RH FINAL] Plugin initialization');

    // Ждем готовности Lampa с таймаутом
    function waitForLampa(callback, attempts = 0) {
        if(window.Lampa && window.Lampa.Plugins) {
            callback();
        } else if(attempts < 30) {
            setTimeout(() => waitForLampa(callback, attempts + 1), 100);
        } else {
            console.error('[RH FINAL] Lampa not found');
        }
    }

    waitForLampa(() => {
        console.log('[RH FINAL] Lampa ready, creating source');

        // Создаем источник с улучшенным отображением
        const FinalSource = {
            name: "Ваш источник", // Будет видно в интерфейсе
            id: "your_final_source",
            type: "universal", // Для фильмов и сериалов
            version: "2.1",
            icon: "https://reyohoho-gitlab.vercel.app/favicon.ico", // Ваша иконка
            
            // Главный метод для загрузки контента
            sources: function(item, callback) {
                console.log('[RH FINAL] Requesting sources for:', item.title);
                
                // Формируем умный запрос
                const params = {
                    q: item.title,
                    tmdb_id: item.id,
                    year: item.year,
                    type: item.type || (item.seasons ? 'tv' : 'movie'),
                    clean_title: item.title.replace(/[^\w\sа-яА-Я]/gi, '').trim()
                };

                fetch(`https://reyohoho-gitlab.vercel.app/api/search?` + new URLSearchParams(params))
                    .then(response => {
                        if(!response.ok) throw new Error('HTTP ' + response.status);
                        return response.json();
                    })
                    .then(data => {
                        // Форматируем ответ специально для Lampa
                        const formatted = {
                            // Метаданные для отображения
                            meta: {
                                source: "Ваш источник",
                                link: "https://reyohoho-gitlab.vercel.app",
                                icon: this.icon
                            },
                            // Контент для плеера
                            movie: [],
                            tv: []
                        };

                        if(Array.isArray(data)) {
                            data.forEach(source => {
                                const result = {
                                    title: source.title || item.title,
                                    file: source.url,
                                    quality: source.quality || 'HD',
                                    // Дополнительные поля
                                    provider: "Ваш источник",
                                    external: {
                                        name: "Перейти на сайт",
                                        link: "https://reyohoho-gitlab.vercel.app"
                                    }
                                };

                                if(params.type === 'movie') {
                                    formatted.movie.push(result);
                                } else {
                                    formatted.tv.push({
                                        season: source.season || 1,
                                        episodes: [{
                                            episode: source.episode || 1,
                                            files: [result]
                                        }]
                                    });
                                }
                            });
                        }

                        console.log('[RH FINAL] Prepared data:', formatted);
                        callback(formatted);
                    })
                    .catch(error => {
                        console.error('[RH FINAL] Error:', error);
                        callback({movie: [], tv: [], meta: this.meta});
                    });
            },

            // Явное указание для отображения в UI
            display: {
                name: "Ваш источник",
                icon: this.icon,
                description: "Контент предоставлен вашим сайтом"
            }
        };

        // Принудительная регистрация во всех случаях
        try {
            if(typeof window.Lampa.Plugins.register === 'function') {
                window.Lampa.Plugins.register(FinalSource);
            } else {
                if(!Array.isArray(window.Lampa.Plugins)) {
                    window.Lampa.Plugins = [];
                }
                window.Lampa.Plugins.push(FinalSource);
            }
            console.log('[RH FINAL] Source fully registered');
        } catch(e) {
            console.error('[RH FINAL] Registration failed:', e);
        }
    });

    // Дублирующая регистрация через 3 секунды для надежности
    setTimeout(() => {
        if(window.Lampa && !window._rh_final_registered) {
            window._rh_final_registered = true;
            console.log('[RH FINAL] Additional registration');
            const backup = {
                name: "Ваш источник",
                sources: () => ({movie: [], tv: []}),
                display: {
                    name: "Ваш источник",
                    icon: "https://reyohoho-gitlab.vercel.app/favicon.ico"
                }
            };
            window.Lampa.Plugins.push(backup);
        }
    }, 3000);
})();
