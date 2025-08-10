(function() {
    'use strict';

    // Проверка на дублирование
    if (window.__reyohoho_provider_plugin) return;
    window.__reyohoho_provider_plugin = true;

    // Конфигурация провайдера
    const providerConfig = {
        name: "ReYohoho",
        description: "Прямые ссылки с reyohoho.github.io",
        version: "1.0",
        type: "movie,tv",
        icon: "https://reyohoho.github.io/favicon.ico"
    };

    // Основная функция получения ссылки
    function getUrl(params) {
        return new Promise((resolve) => {
            try {
                const id = params.tmdb_id || params.kinopoisk_id;
                const type = params.type || (params.movie?.name ? 'tv' : 'movie');

                if (!id) {
                    console.error("ReYohoho: ID контента не найден");
                    return resolve(null);
                }

                // Формируем URL для плеера
                let url = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                
                if (type === 'tv') {
                    url += `&season=${params.season || 1}&episode=${params.episode || 1}`;
                }

                resolve({
                    url: url,
                    name: providerConfig.name,
                    title: params.title || "ReYohoho",
                    external: false,
                    headers: {
                        "Referer": "https://reyohoho.github.io/",
                        "Origin": "https://reyohoho.github.io"
                    }
                });

            } catch (e) {
                console.error("ReYohoho error:", e);
                resolve(null);
            }
        });
    }

    // Регистрация провайдера
    function registerProvider() {
        // Для новых версий Lampa (4.x+)
        if (typeof Lampa !== 'undefined' && Lampa.Plugins) {
            Lampa.Plugins.add({
                name: providerConfig.name,
                component: {
                    config: providerConfig,
                    get: getUrl
                }
            });
            console.log("ReYohoho provider зарегистрирован через Lampa.Plugins");
        } 
        // Для версий 3.x
        else if (typeof window.plugin_provider === 'function') {
            window.plugin_provider({
                config: providerConfig,
                get: getUrl
            });
            console.log("ReYohoho provider зарегистрирован через plugin_provider");
        }
        // Для версий 2.4.6
        else if (typeof window.extensions_provider !== 'undefined') {
            window.extensions_provider = window.extensions_provider || [];
            window.extensions_provider.push({
                config: providerConfig,
                get: getUrl
            });
            console.log("ReYohoho provider добавлен через extensions_provider");
        }
        else {
            console.error("ReYohoho: Не удалось зарегистрировать провайдер");
        }
    }

    // Автоматическая регистрация
    if (document.readyState === 'complete') {
        registerProvider();
    } else {
        window.addEventListener('load', registerProvider);
    }

    // Добавляем кнопку в интерфейс (дополнительно)
    function addButton() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && e.data?.movie) {
                const movie = e.data.movie;
                if (!movie.tmdb_id && !movie.kinopoisk_id) return;

                const button = `
                    <div class="full-start__button view--reyohoho">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                        <span>Смотреть на ReYohoho</span>
                    </div>`;
                
                const btn = $(button);
                btn.on('hover:enter', function() {
                    getUrl({...movie, type: movie.name ? 'tv' : 'movie'})
                        .then(result => {
                            if (result) Lampa.Player.play(result.url, result);
                        });
                });
                
                e.object.activity.render()
                    .find('.view--torrent')
                    .last()
                    .after(btn);
            }
        });
    }

    // Инициализация кнопки
    if (window.appready) {
        addButton();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') addButton();
        });
    }

})();
