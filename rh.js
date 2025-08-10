(function() {
    'use strict';

    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    const ReYohohoHandler = {
        play: async function(data) {
            try {
                // 1. Добавляем проверку на наличие movie и его ID
                if (!data?.movie) {
                    throw new Error('No movie data provided');
                }

                const movie = data.movie;
                const type = movie.name ? 'tv' : 'movie';
                const id = movie.tmdb_id || movie.kinopoisk_id;

                // 2. Проверяем что ID существует
                if (!id) {
                    throw new Error('No valid movie ID found (tmdb_id or kinopoisk_id required)');
                }

                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                
                // 3. Добавляем лог URL для отладки
                console.log('Fetching ReYohoho URL:', contentUrl);
                
                const response = await fetch(contentUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const html = await response.text();
                const videoUrl = html.match(/(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i)?.[0];
                
                if (!videoUrl) throw new Error('Видео не найдено');
                
                Lampa.Player.play({
                    url: videoUrl,
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
                
                // 4. Добавляем проверку ID для fallback
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

    // Остальная инициализация без изменений
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

    console.log('ReYohoho plugin initialized');
})();
