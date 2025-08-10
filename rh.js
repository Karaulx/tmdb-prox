(function() {
    'use strict';

    // 1. Защита от дублирования как в torrents.js
    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    // 2. Все обработчики ReYohoho
    const ReYohohoHandler = {
        // Главный обработчик клика
        play: async function(data) {
            try {
                const type = data.movie.name ? 'tv' : 'movie';
                const id = data.movie.tmdb_id || data.movie.kinopoisk_id;
                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                
                // Получаем HTML страницы
                const response = await fetch(contentUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const html = await response.text();
                
                // Ищем видео (аналогично torrents.js)
                const videoUrl = html.match(/(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i)?.[0];
                if (!videoUrl) throw new Error('Видео не найдено');
                
                // Запуск плеера
                Lampa.Player.play({
                    url: videoUrl,
                    title: data.movie.title || data.movie.name,
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
                
                // Fallback (как в torrents.js)
                const playerUrl = `https://reyohoho.github.io/player.html?id=${data.movie.tmdb_id || data.movie.kinopoisk_id}&type=${data.movie.name ? 'tv' : 'movie'}`;
                Lampa.Player.play({
                    url: playerUrl,
                    title: data.movie.title || data.movie.name,
                    external: false
                });
            }
        },

        // Обработчик для меню (аналог torrents.js)
        menu: function() {
            return {
                name: 'reyohoho',
                title: 'ReYohoho',
                icon: '<svg width="24" height="24"><use xlink:href="#player"/></svg>',
                handler: this.play.bind(this)
            };
        },

        // Обработчик кнопки в интерфейсе
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

    // 3. Инициализация как в torrents.js
    function init() {
        // Добавляем кнопку
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite' && e.data && e.object) {
                const target = e.object.activity.render().find('.view--torrent').last();
                target.length 
                    ? target.after(ReYohohoHandler.button(e)) 
                    : e.object.activity.render().find('.full-start__buttons').append(ReYohohoHandler.button(e));
            }
        });

        // Регистрируем обработчик
        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho',
                title: 'ReYohoho',
                priority: 10,
                handler: ReYohohoHandler.play.bind(ReYohohoHandler)
            });
        }

        // Добавляем в меню (опционально)
        if (Lampa.Menu?.add) {
            Lampa.Menu.add(ReYohohoHandler.menu());
        }
    }

    // Запуск
    if (window.appready) init();
    else Lampa.Listener.follow('app', (e) => e.type === 'ready' && init());

    console.log('ReYohoho plugin initialized (torrents.js style)');
})();
