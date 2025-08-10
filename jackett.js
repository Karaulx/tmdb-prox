(function() {
    // Проверка на дублирование
    if (window.__reyohoho_plugin_final) return;
    window.__reyohoho_plugin_final = true;

    // Конфигурация плагина
    var config = {
        name: "ReYohoho",
        description: "Прямые ссылки с reyohoho.github.io",
        version: "1.0",
        type: "movie,tv",
        icon: "https://reyohoho.github.io/favicon.ico",
        id: "reyohoho_source_" + Math.random().toString(36).substring(2, 9)
    };

    // Безопасное создание URL
    function createSafeUrl(params) {
        var base = "https://reyohoho.github.io/player.html";
        var query = [];
        
        // Обязательные параметры
        var id = params.kinopoisk_id || params.tmdb_id || '';
        query.push("id=" + encodeURIComponent(id));
        query.push("type=" + (params.type || 'movie'));

        // Параметры для сериалов
        if (params.type === 'tv') {
            query.push("season=" + (params.season || 1));
            query.push("episode=" + (params.episode || 1));
        }

        // Заголовки для CORS
        var headers = {
            "Referer": "https://reyohoho.github.io/",
            "Origin": "https://reyohoho.github.io"
        };

        return {
            url: base + "?" + query.join("&"),
            headers: headers
        };
    }

    // Основная функция получения ссылки
    function getUrl(params, callback) {
        try {
            var result = createSafeUrl(params);
            
            callback({
                url: result.url,
                name: config.name,
                title: params.title || "ReYohoho",
                external: false,
                headers: result.headers
            });

        } catch (e) {
            console.error("ReYohoho plugin error:", e);
            callback(null);
        }
    }

    // Совместимость с разными версиями Lampa
    function registerPlugin() {
        // Для новых версий Lampa (4.x+)
        if (typeof Lampa !== 'undefined' && Lampa.Plugins) {
            Lampa.Plugins.add({
                name: config.name,
                component: {
                    config: config,
                    get: getUrl
                }
            });
            console.log("ReYohoho plugin registered via Lampa.Plugins");
        }
        // Для Lampa 3.x
        else if (typeof window.plugin_provider === 'function') {
            window.plugin_provider({
                config: config,
                get: getUrl
            });
            console.log("ReYohoho plugin registered via plugin_provider");
        }
        // Для Lampa 2.4.6
        else if (typeof window.extensions_provider !== 'undefined') {
            window.extensions_provider.push({
                config: config,
                get: getUrl
            });
            console.log("ReYohoho plugin registered via extensions_provider");
        }
        else {
            console.error("ReYohoho plugin registration failed - no compatible API found");
        }
    }

    // Автоматическая регистрация
    if (document.readyState === 'complete') {
        registerPlugin();
    } else {
        window.addEventListener('load', registerPlugin);
    }
})();
