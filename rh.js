(function() {
    'use strict';

    function startPlugin() {
        window.plugin_reyohoho_ready = true;

        function add() {
            // Добавляем кнопку в интерфейс
            Lampa.Listener.follow('full', function(e) {
                if (e.type == 'complite' && e.data && e.data.movie) {
                    // Проверяем наличие ID перед созданием кнопки
                    const movie = e.data.movie;
                    if (!movie.tmdb_id && !movie.kinopoisk_id) {
                        console.log('ReYohoho: Пропуск - нет ID контента');
                        return;
                    }

                    var button = `
                        <div class="full-start__button view--reyohoho">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                            <span>Смотреть на ReYohoho</span>
                        </div>`;
                    
                    var btn = $(button);
                    btn.on('hover:enter', function() {
                        handlePlayback(movie);
                    });
                    
                    e.object.activity.render().find('.view--torrent').last().after(btn);
                }
            });

            // Основная функция воспроизведения
            function handlePlayback(movie) {
                try {
                    if (!movie) {
                        Lampa.Noty.show('Ошибка: нет данных о фильме');
                        return;
                    }

                    const id = movie.tmdb_id || movie.kinopoisk_id;
                    if (!id) {
                        Lampa.Noty.show('Ошибка: ID контента не найден');
                        return;
                    }

                    const type = movie.name ? 'tv' : 'movie';
                    const playerUrl = `https://reyohoho.github.io/player.html?` + 
                                     `id=${id}&type=${type}` + 
                                     (type === 'tv' ? '&season=1&episode=1' : '');

                    // Запускаем плеер с проверкой URL
                    if (isValidUrl(playerUrl)) {
                        Lampa.Player.play(playerUrl, {
                            title: movie.title || movie.name,
                            external: false,
                            headers: {
                                'Referer': 'https://reyohoho.github.io/',
                                'Origin': 'https://reyohoho.github.io'
                            }
                        });
                    } else {
                        Lampa.Noty.show('Некорректный URL для воспроизведения');
                    }
                    
                } catch (error) {
                    console.error('ReYohoho playback error:', error);
                    Lampa.Noty.show('Ошибка запуска плеера');
                }
            }

            // Проверка валидности URL
            function isValidUrl(url) {
                try {
                    new URL(url);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        }

        // Инициализация плагина
        if (window.appready) add(); 
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.plugin_reyohoho_ready) startPlugin();
})();
