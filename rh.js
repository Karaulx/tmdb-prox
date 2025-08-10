(function() {
    // Проверка на дублирование
    if (window.__reyohoho_simple_provider) return;
    window.__reyohoho_simple_provider = true;

    // Конфигурация провайдера
    const config = {
        name: "ReYohoho",
        type: "movie,tv",
        icon: "https://reyohoho.github.io/favicon.ico"
    };

    // Функция получения ссылки
    function getUrl(params) {
        try {
            const id = params.tmdb_id || params.kinopoisk_id;
            if (!id) throw new Error("ID не найден");

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

    // Регистрация (только через extensions_provider для Lampa 2.4.6)
    if (typeof window.extensions_provider !== 'undefined') {
        window.extensions_provider.push({
            config: config,
            get: getUrl
        });
        console.log("ReYohoho добавлен в источники");
    } else {
        console.error("ReYohoho: extensions_provider не найден");
    }

})();
