(function() {
    'use strict';

    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    const ReYohohoHandler = {
        play: async function(data) {
            try {
                // 1. Проверка и получение данных фильма
                if (!data?.movie) {
                    throw new Error('No movie data provided');
                }

                const movie = data.movie;
                const type = movie.name ? 'tv' : 'movie';
                const id = movie.tmdb_id || movie.kinopoisk_id;

                if (!id) {
                    throw new Error('No valid movie ID found');
                }

                const contentUrl = `https://reyohoho.github.io/reyohoho/${type}/${id}`;
                console.log('Fetching ReYohoho URL:', contentUrl);
                
                // 2. Новая логика получения m3u8
                const response = await fetch(contentUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const html = await response.text();
                const m3u8Url = html.match(/(https?:\/\/[^\s]+\.m3u8)/)?.[0];
                
                if (!m3u8Url) throw new Error('m3u8 stream not found');
                console.log("Found stream:", m3u8Url);
                
                // 3. Запуск плеера с правильными параметрами
                Lampa.Player.play({
                    url: m3u8Url,
                    title: movie.title || movie.name,
                    external: false,
                    source: 'reyohoho',
                    headers: {
                        'Referer': contentUrl,
                        'Origin': 'https://reyohoho.github.io'
                    }
                });
                
            } catch (error) {
                console.error('ReYohoho Error:', error);
                Lampa.Noty.show('Ошибка ReYohoho');
                
                // 4. Fallback на player.html если есть ID
                if (data?.movie && (data.movie.tmdb_id || data.movie.kinopoisk_id)) {
                    const type = data.movie.name ? 'tv' : 'movie';
                    const id = data.movie.tmdb_id || data.movie.kinopoisk_id;
                    const playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                    
                    Lampa.Player.play({
                        url: playerUrl,
                        title: data.movie.title || data.movie.name,
                        external: false
                    });
                }
            }
        },

        // Остальные обработчики без изменений
        menu: function() {
            return {
                name: 'reyohoho',
                title: 'ReYohoho',
                icon: '<svg width="24" height="24"><use xlink:href="#player"/></svg>',
                handler: this.play.bind(this)
            };
        },

        button: function(e) {
            const button = `
                <div class="full-start__button view--reyohoho">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <span>ReYohoho</span>
                </div>
            `;
            
            const btn = $(button);
            btn.on('hover:enter', () => this.play(e.data));
            return btn;
        }
    };

    // Инициализация без изменений
    function init() {
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite' && e.data && e.object) {
                const target = e.object.activity.render().find('.view--torrent').last();
                target.length 
                    ? target.after(ReYohohoHandler.button(e)) 
                    : e.object.activity.render().find('.full-start__buttons').append(ReYohohoHandler.button(e));
            }
        });

        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho',
                title: 'ReYohoho',
                priority: 10,
                handler: ReYohohoHandler.play.bind(ReYohohoHandler)
            });
        }

        if (Lampa.Menu?.add) {
            Lampa.Menu.add(ReYohohoHandler.menu());
        }
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', (e) => e.type === 'ready' && init());

    console.log('ReYohoho plugin initialized with m3u8 parser');
})();
