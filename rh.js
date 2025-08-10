(function() {
    'use strict';

    function startPlugin() {
        window.plugin_reyohoho_ready = true;

        function add() {
            function button_click(data) {
                Lampa.Activity.push({
                    url: '',
                    title: 'ReYohoho',
                    component: 'reyohoho',
                    movie: data.movie,
                    type: data.movie.name ? 'tv' : 'movie'
                });
            }

            // Добавляем кнопку на карточку фильма/сериала
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
                        button_click(e.data);
                    });
                    
                    if (e.data && e.object) {
                        e.object.activity.render().find('.view--torrent').last().after(btn);
                    }
                }
            });

            // Регистрируем компонент для обработки просмотра
            Lampa.Component.add('reyohoho', {
                create: function() {
                    var network = new Lampa.Reguest();
                    var scroll = new Lampa.Scroll({mask: true, over: true});
                    var files = new Lampa.Explorer(this);
                    
                    this.loading = function(status) {
                        if (status) files.loading(true);
                        else files.loading(false);
                    };

                    this.start = function() {
                        var movie = this.movie;
                        var type = this.type;
                        
                        this.loading(true);
                        
                        // Формируем URL для ReYohoho
                        var url = 'https://reyohoho.github.io/player.html?' + 
                                  'id=' + (movie.kinopoisk_id || movie.tmdb_id) + 
                                  '&type=' + type;
                        
                        if (type === 'tv') {
                            url += '&season=1&episode=1';
                        }
                        
                        // Открываем в плеере Lampa
                        Lampa.Player.play(url, {
                            title: movie.title || movie.name,
                            external: false,
                            headers: {
                                'Referer': 'https://reyohoho.github.io/',
                                'Origin': 'https://reyohoho.github.io'
                            }
                        });
                        
                        this.loading(false);
                        Lampa.Activity.backward();
                    };
                    
                    return files.render();
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
