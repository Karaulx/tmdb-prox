// ReYohoho Provider для Lampa 2.4.6
(function() {
    // Уникальный идентификатор плагина
    if (window.__reyohoho_246_plugin) return;
    window.__reyohoho_246_plugin = true;

    // Конфигурация (обязательные поля для Lampa 2.x)
    var providerConfig = {
        name: "ReYohoho",
        description: "Прямые ссылки через reyohoho.github.io",
        version: "1.2",
        type: "movie,tv", // Важно! Указать оба типа через запятую
        icon: "https://i.imgur.com/3YXh7Qy.png" // Прозрачная иконка 256x256
    };

    // Основная функция получения ссылки
    function getStream(params, callback) {
        try {
            // 1. Получаем идентификаторы
            var id = params.kinopoisk_id || params.tmdb_id;
            if (!id) throw new Error("Не получен ID контента");

            // 2. Формируем URL
            var baseUrl = "https://reyohoho.github.io/player.html";
            var url = baseUrl + "?id=" + id + "&type=" + (params.type || 'movie');

            // 3. Для сериалов добавляем параметры
            if (params.type === 'tv') {
                url += "&season=" + (params.season || 1);
                url += "&episode=" + (params.episode || 1);
            }

            // 4. Возвращаем результат
            callback({
                url: url,
                name: providerConfig.name,
                title: params.title + " (ReYohoho)",
                external: false, // Важно для встроенного плеера
                headers: {
                    "Referer": "https://reyohoho.github.io/",
                    "Origin": "https://reyohoho.github.io"
                }
            });

        } catch (e) {
            console.error("[ReYohoho] Ошибка:", e);
            callback(null);
        }
    }

    // Регистрация в Lampa 2.4.6
    if (window.extensions_provider) {
        window.extensions_provider.push({
            config: providerConfig,
            get: getStream
        });
        console.log("[ReYohoho] Плагин успешно зарегистрирован");
    } else {
        console.error("[ReYohoho] Не найден extensions_provider");
    }
})();
