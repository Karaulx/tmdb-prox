(function() {
    // Проверка на дублирование
    if (window.__reyohoho_safe_provider) return;
    window.__reyohoho_safe_provider = true;

    // Конфигурация провайдера
    const config = {
        name: "ReYohoho",
        type: "movie,tv",
        icon: "https://reyohoho.github.io/favicon.ico"
    };

    // Функция получения ссылки
    function getUrl(params) {
        try {
            // Берем ID из стандартных параметров Lampa
            const id = params.id || params.tmdb_id || params.kinopoisk_id;
            if (!id) {
                console.warn("ReYohoho: ID контента не передан");
                return null;
            }

            // Формируем URL без парсинга HTML
            const type = params.type || (params.movie?.name ? 'tv' : 'movie');
            let url = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
            
            if (type === 'tv') {
                url += `&season=${params.season || 1}&episode=${params.episode || 1}`;
            }

            return {
                url: url,
                name: config.name,
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

    // Безопасная регистрация
    function safeRegister() {
        try {
            // Для Lampa 2.4.6
            if (typeof window.extensions_provider !== 'undefined') {
                if (!Array.isArray(window.extensions_provider)) {
                    window.extensions_provider = [];
                }
                window.extensions_provider.push({
                    config: config,
                    get: getUrl
                });
                console.log("ReYohoho: добавлен в источники (Lampa 2.4.6)");
                return;
            }

            // Для новых версий
            if (typeof Lampa !== 'undefined' && Lampa.Plugins) {
                Lampa.Plugins.add({
                    name: config.name,
                    component: {
                        config: config,
                        get: getUrl
                    }
                });
                console.log("ReYohoho: добавлен в источники (Lampa 4.x+)");
                return;
            }

            console.warn("ReYohoho: не удалось зарегистрировать провайдер");
        } catch (e) {
            console.error("ReYohoho registration error:", e);
        }
    }

    // Отложенная инициализация
    setTimeout(safeRegister, 1000);
})();
