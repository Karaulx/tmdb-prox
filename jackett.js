(function() {
    'use strict';

    function startPlugin() {
        window.plugin_reyohoho_ready = true;

        function add() {
            // Добавляем кнопку просмотра
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
                        var movie = e.data.movie;
                        var type = movie.name ? 'tv' : 'movie';
                        
                        // Формируем URL для ReYohoho
                        var url = 'https://reyohoho.github.io/player.html?' + 
                                  'id=' + (movie.kinopoisk_id || movie.tmdb_id) + 
                                  '&type=' + type;
                        
                        // Для сериалов добавляем параметры
                        if (type === 'tv') {
                            url += '&season=1&episode=1';
                        }
                        
                        // Получаем ссылку на видео
                        fetch(url)
                            .then(response => response.text())
                            .then(html => {
                                // Парсим HTML чтобы найти m3u8 ссылку
                                var parser = new DOMParser();
                                var doc = parser.parseFromString(html, 'text/html');
                                var videoUrl = doc.querySelector('video source')?.src;
                                
                                if (videoUrl) {
                                    // Запускаем плеер
                                    Lampa.Player.play(videoUrl, {
                                        title: movie.title || movie.name,
                                        external: false,
                                        headers: {
                                            'Referer': 'https://reyohoho.github.io/',
                                            'Origin': 'https://reyohoho.github.io'
                                        }
                                    });
                                } else {
                                    Lampa.Noty.show('Не удалось получить ссылку на видео');
                                }
                            })
                            .catch(error => {
                                console.error('ReYohoho error:', error);
                                Lampa.Noty.show('Ошибка при получении данных');
                            });
                    });
                    
                    if (e.data && e.object) {
                        e.object.activity.render().find('.view--torrent').last().after(btn);
                    }
                }
            });
        }

        if (window.appready) add(); 
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.plugin_reyohoho_ready) startPlugin();
})();
