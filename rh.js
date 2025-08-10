(function() {
    'use strict';

    function startPlugin() {
        window.plugin_reyohoho_ready = true;

        function add() {
            // Добавляем кнопку в интерфейс
            Lampa.Listener.follow('full', function(e) {
                if (e.type == 'complite') {
                    var button = `
                        <div class="full-start__button view--reyohoho">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                            <span>Смотреть на ReYohoho</span>
                        </div>`;
                    
                    var btn = $(button);
                    btn.on('hover:enter', function() {
                        handlePlayback(e.data.movie);
                    });
                    
                    if (e.data && e.object) {
                        e.object.activity.render().find('.view--torrent').last().after(btn);
                    }
                }
            });

            // Функция воспроизведения
            function handlePlayback(movie) {
                try {
                    const id = movie.tmdb_id || movie.kinopoisk_id;
                    if (!id) {
                        Lampa.Noty.show('Ошибка: ID контента не найден');
                        return;
                    }

                    const type = movie.name ? 'tv' : 'movie';
                    let playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                    
                    if (type === 'tv') {
                        playerUrl += `&season=1&episode=1`;
                    }

                    // Запускаем плеер
                    Lampa.Player.play(playerUrl, {
                        title: movie.title || movie.name,
                        external: false,
                        headers: {
                            'Referer': 'https://reyohoho.github.io/',
                            'Origin': 'https://reyohoho.github.io'
                        },
                        params: {
                            tmdb_id: movie.tmdb_id,
                            kinopoisk_id: movie.kinopoisk_id
                        }
                    });

                } catch (error) {
                    console.error('ReYohoho error:', error);
                    Lampa.Noty.show('Ошибка запуска плеера');
                }
            }
        }

        // Инициализация
        if (window.appready) add(); 
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.plugin_reyohoho_ready) startPlugin();
})();
