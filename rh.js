(function() {
    'use strict';

    function startPlugin() {
        window.plugin_reyohoho_ready = true;

        function add() {
            // 1. Добавляем кнопку в интерфейс
            Lampa.Listener.follow('full', function(e) {
                if (e.type == 'complite' && e.data?.movie) {
                    const movie = e.data.movie;
                    
                    // Проверяем наличие ID
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
                        launchPlayer(movie);
                    });
                    
                    e.object.activity.render()
                        .find('.view--torrent')
                        .last()
                        .after(btn);
                }
            });

            // 2. Функция запуска плеера
            function launchPlayer(movie) {
                try {
                    const id = movie.tmdb_id || movie.kinopoisk_id;
                    const type = movie.name ? 'tv' : 'movie';
                    
                    // Формируем URL для плеера
                    const playerUrl = new URL('https://reyohoho.github.io/player.html');
                    playerUrl.searchParams.set('id', id);
                    playerUrl.searchParams.set('type', type);
                    
                    if (type === 'tv') {
                        playerUrl.searchParams.set('season', '1');
                        playerUrl.searchParams.set('episode', '1');
                    }

                    // Запускаем плеер
                    Lampa.Player.play(playerUrl.toString(), {
                        title: movie.title || movie.name,
                        external: false,
                        headers: {
                            'Referer': 'https://reyohoho.github.io/',
                            'Origin': 'https://reyohoho.github.io'
                        }
                    });

                } catch (error) {
                    console.error('ReYohoho error:', error);
                    Lampa.Noty.show('Ошибка запуска плеера');
                }
            }

            // 3. Регистрируем провайдер для списка источников
            if (typeof window.plugin_provider === 'function') {
                window.plugin_provider({
                    name: 'ReYohoho',
                    type: 'plugin',
                    getUrl: function(params) {
                        const id = params.tmdb_id || params.kinopoisk_id;
                        const type = params.type || 'movie';
                        
                        const url = new URL('https://reyohoho.github.io/player.html');
                        url.searchParams.set('id', id);
                        url.searchParams.set('type', type);
                        
                        if (type === 'tv') {
                            url.searchParams.set('season', params.season || '1');
                            url.searchParams.set('episode', params.episode || '1');
                        }

                        return {
                            url: url.toString(),
                            name: 'ReYohoho',
                            title: params.title,
                            external: false
                        };
                    }
                });
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
