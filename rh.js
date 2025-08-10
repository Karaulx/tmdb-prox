(function() {
    'use strict';
    
    // 1. Проверка дублирования
    if (window.__reyohoho_fix_provider) return;
    window.__reyohoho_fix_provider = true;

    // 2. Регистрация источника
    function registerProvider() {
        const provider = {
            name: "ReYohoho",
            type: "movie,tv",
            icon: "https://reyohoho.github.io/favicon.ico",
            getUrl: function(params) {
                try {
                    // Получаем ID из параметров
                    const id = params.tmdb_id || params.kinopoisk_id;
                    if (!id) {
                        console.error("ReYohoho: ID контента не найден");
                        return null;
                    }

                    // Формируем URL
                    const type = params.type || (params.movie?.name ? 'tv' : 'movie');
                    let url = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                    
                    if (type === 'tv') {
                        url += `&season=${params.season || 1}&episode=${params.episode || 1}`;
                    }

                    return {
                        url: url,
                        name: "ReYohoho",
                        title: params.title || "ReYohoho",
                        external: false,
                        headers: {
                            "Referer": "https://reyohoho.github.io/",
                            "Origin": "https://reyohoho.github.io"
                        }
                    };

                } catch (e) {
                    console.error("ReYohoho error:", e);
                    return null;
                }
            }
        };

        // Для Lampa 2.4.6
        if (typeof window.extensions_provider !== 'undefined') {
            window.extensions_provider.push(provider);
            console.log("ReYohoho добавлен в источники");
        }
        // Для новых версий
        else if (typeof Lampa !== 'undefined' && Lampa.Plugins) {
            Lampa.Plugins.add({
                name: provider.name,
                component: provider
            });
        }
    }

    // 3. Запуск
    if (document.readyState === 'complete') {
        registerProvider();
    } else {
        window.addEventListener('load', registerProvider);
    }
})();
