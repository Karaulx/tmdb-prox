(function() {
    // Защита от дублирования
    if (window.__reyohoho_plugin) return;
    window.__reyohoho_plugin = true;

    // Конфигурация плагина
    var config = {
        name: "ReYohoho",
        id: "reyohoho_source",
        version: "1.0",
        type: "movie,tv", // Поддержка фильмов и сериалов
        icon: "https://reyohoho.github.io/favicon.ico" // Иконка 256x256
    };

    // Основная функция получения ссылки
    function getUrl(params, callback) {
        try {
            // Получаем ID контента
            var id = params.kinopoisk_id || params.tmdb_id;
            if (!id) throw new Error("ID не найден");

            // Формируем URL для вашего плеера
            var baseUrl = "https://reyohoho.github.io/player.html";
            var url = baseUrl + "?id=" + id + "&type=" + (params.type || 'movie');

            // Для сериалов добавляем сезон и эпизод
            if (params.type === 'tv') {
                url += "&season=" + (params.season || 1);
                url += "&episode=" + (params.episode || 1);
            }

            // Возвращаем данные для Lampa
            callback({
                url: url,
                name: config.name,
                title: params.title + " (ReYohoho)",
                external: false // Используем встроенный плеер Lampa
            });

        } catch (e) {
            console.error("ReYohoho error:", e);
            callback(null);
        }
    }

    // Регистрация провайдера для Lampa 2.4.6
    if (typeof window.extensions_provider !== "undefined") {
        window.extensions_provider.push({
            config: config,
            get: getUrl
        });
        console.log("ReYohoho provider успешно зарегистрирован");
    } else {
        console.error("Lampa 2.4.6 API не найдено");
    }
})();
