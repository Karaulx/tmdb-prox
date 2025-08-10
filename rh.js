(function() {
    // Проверка на дублирование
    if (window.__reyohoho_plugin_v3) return;
    window.__reyohoho_plugin_v3 = true;

    // Конфигурация плагина
    var config = {
        name: "ReYohoho",
        description: "Прямые ссылки с reyohoho.github.io",
        version: "1.0",
        type: "movie,tv", // Поддержка фильмов и сериалов
        icon: "https://reyohoho.github.io/favicon.ico" // Иконка
    };

    // Основная функция получения ссылки
    function getUrl(params, callback) {
        try {
            // Получаем ID контента
            var id = params.kinopoisk_id || params.tmdb_id;
            if (!id) throw new Error("ID контента не найден");

            // Формируем URL для вашего плеера
            var url = "https://reyohoho.github.io/player.html?" + 
                     "id=" + id + 
                     "&type=" + (params.type || 'movie');

            // Для сериалов добавляем сезон и эпизод
            if (params.type === 'tv') {
                url += "&season=" + (params.season || 1) + 
                       "&episode=" + (params.episode || 1);
            }

            // Возвращаем данные для Lampa
            callback({
                url: url,
                name: config.name,
                title: params.title,
                external: false // Используем встроенный плеер Lampa
            });

        } catch (e) {
            console.error("ReYohoho error:", e);
            callback(null);
        }
    }

    // Совместимость с разными версиями Lampa
    function registerProvider() {
        // Для Lampa 2.4.6 и старых версий
        if (typeof window.extensions_provider !== "undefined") {
            window.extensions_provider.push({
                config: config,
                get: getUrl
            });
            console.log("ReYohoho provider зарегистрирован через extensions_provider");
        } 
        // Для новых версий Lampa
        else if (typeof window.plugin_provider === "function") {
            window.plugin_provider({
                config: config,
                get: getUrl
            });
            console.log("ReYohoho provider зарегистрирован через plugin_provider");
        }
        else {
            console.error("Не удалось зарегистрировать провайдер - API Lampa не найдено");
        }
    }

    // Автоматическая регистрация при загрузке
    if (document.readyState === "complete") {
        registerProvider();
    } else {
        window.addEventListener("load", registerProvider);
    }
})();
