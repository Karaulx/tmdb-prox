(function() {
    'use strict';

    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    const ReYohohoHandler = {
        cache: {}, // Кеш для хранения найденных ссылок

        async extractStream(id, type) {
            // 1. Проверка кеша
            if (this.cache[`${type}_${id}`]) {
                console.log('Используем кешированную ссылку');
                return this.cache[`${type}_${id}`];
            }

            // 2. Прямой запрос к API (если доступен)
            try {
                const apiUrl = `https://api.reyohoho.live/stream?tmdb_id=${id}&type=${type}`;
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.url) {
                        this.cache[`${type}_${id}`] = data.url;
                        return data.url;
                    }
                }
            } catch (e) {
                console.log('API недоступен, пробуем парсинг страницы');
            }

            // 3. Парсинг HTML страницы
            const pageUrl = `https://reyohoho.github.io/reyohoho/${type}/${id}`;
            try {
                const response = await fetch(pageUrl);
                const html = await response.text();
                
                // Ищем HLS или MP4
                const m3u8Match = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
                const mp4Match = html.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
                
                const streamUrl = m3u8Match?.[0] || mp4Match?.[0];
                if (streamUrl) {
                    this.cache[`${type}_${id}`] = streamUrl;
                }
                return streamUrl;
            } catch (e) {
                console.error('Ошибка парсинга:', e);
                return null;
            }
        },

        play: async function(data) {
            try {
                if (!data?.movie) throw new Error('Нет данных о фильме');

                const movie = data.movie;
                const type = movie.name ? 'tv' : 'movie';
                const id = movie.tmdb_id || movie.kinopoisk_id;
                if (!id) throw new Error('Не найден ID фильма');

                // Получаем ссылку через новый метод
                const streamUrl = await this.extractStream(id, type);
                if (!streamUrl) throw new Error('Не удалось получить ссылку на поток');

                console.log("Найден поток:", streamUrl);
                
                Lampa.Player.play({
                    url: streamUrl,
                    title: movie.title || movie.name,
                    external: false,
                    source: 'reyohoho',
                    headers: {
                        'Referer': 'https://reyohoho.github.io/',
                        'Origin': 'https://reyohoho.github.io'
                    }
                });
                
            } catch (error) {
                console.error('ReYohoho Error:', error);
                Lampa.Noty.show('Ошибка ReYohoho');
                
                // Fallback
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

    console.log('ReYohoho plugin initialized with improved link handling');
})();
