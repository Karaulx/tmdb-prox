(function() {
    if (window.__reyohoho_stable_plugin) return;
    window.__reyohoho_stable_plugin = true;

    class ReYohohoProvider {
        constructor() {
            this.name = "ReYohoho";
            this.id = "reyohoho_source";
            this.type = "plugin";
            this.icon = "https://reyohoho.github.io/favicon.ico";
            this.version = "1.2";
            this.supports = ["movie", "tv"];
        }

        async getUrl(params) {
            try {
                const id = params.tmdb_id || params.kinopoisk_id;
                if (!id) throw new Error("ID контента не найден");

                // Формируем прямую ссылку на плеер
                const url = this.buildPlayerUrl(id, params);
                
                return {
                    url: url,
                    name: this.name,
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

        buildPlayerUrl(id, params) {
            let url = `https://reyohoho.github.io/player.html?id=${id}`;
            
            if (params.type === 'tv') {
                url += `&season=${params.season || 1}&episode=${params.episode || 1}`;
            } else {
                url += '&type=movie';
            }

            return url;
        }
    }

    // Совместимость со всеми версиями Lampa
    function register() {
        // Для новых версий (4.x+)
        if (typeof Lampa !== 'undefined' && Lampa.Plugins) {
            Lampa.Plugins.add({
                name: "ReYohoho",
                component: new ReYohohoProvider()
            });
        } 
        // Для версий 3.x
        else if (typeof window.plugin_provider === 'function') {
            window.plugin_provider(new ReYohohoProvider());
        }
        // Для версий 2.x
        else if (typeof window.extensions_provider !== 'undefined') {
            window.extensions_provider = window.extensions_provider || [];
            window.extensions_provider.push(new ReYohohoProvider());
        }
    }

    // Автоматическая регистрация
    if (document.readyState === 'complete') {
        register();
    } else {
        window.addEventListener('load', register);
    }
})();
