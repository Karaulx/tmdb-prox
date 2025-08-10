(function() {
    // Проверка на дублирование
    if (window.__reyohoho_plugin_v4) return;
    window.__reyohoho_plugin_v4 = true;

    // Конфигурация плагина
    var config = {
        name: "ReYohoho",
        description: "Прямые ссылки с reyohoho.github.io",
        version: "1.0",
        type: "movie,tv",
        icon: "https://reyohoho.github.io/favicon.ico"
    };

    // Основная функция получения ссылки
    function getUrl(params, callback) {
        try {
            var id = params.kinopoisk_id || params.tmdb_id;
            if (!id) throw new Error("ID контента не найден");

            var url = "https://reyohoho.github.io/player.html?" + 
                     "id=" + id + 
                     "&type=" + (params.type || 'movie');

            if (params.type === 'tv') {
                url += "&season=" + (params.season || 1) + 
                       "&episode=" + (params.episode || 1);
            }

            callback({
                url: url,
                name: config.name,
                title: params.title,
                external: false
            });

        } catch (e) {
            console.error("ReYohoho error:", e);
            callback(null);
        }
    }

    // Совместимость с новым API Lampa
    if (typeof Lampa === 'object' && Lampa.Plugins) {
        Lampa.Plugins.add({
            name: config.name,
            component: {
                config: config,
                get: getUrl
            }
        });
        console.log("ReYohoho plugin зарегистрирован через Lampa.Plugins");
    }
    // Совместимость со старыми версиями
    else if (typeof window.extensions_provider !== "undefined") {
        window.extensions_provider.push({
            config: config,
            get: getUrl
        });
        console.log("ReYohoho plugin зарегистрирован через extensions_provider");
    }
    else {
        console.error("Не удалось зарегистрировать плагин - API Lampa не найдено");
    }
})();
