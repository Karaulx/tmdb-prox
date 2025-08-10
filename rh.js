(function() {
    'use strict';

    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    const ReYohohoHandler = {
        play: async function(data) {
            try {
                // 1. Улучшенное получение данных фильма
                const movie = data?.movie || data?.item || data;
                if (!movie) {
                    console.error('Полученные данные:', data);
                    throw new Error('Не получены данные фильма');
                }

                // 2. Все возможные варианты получения ID
                const type = movie.name ? 'tv' : 'movie';
                const id = movie.tmdb_id || movie.kinopoisk_id || 
                          movie.id || (movie.ids && (movie.ids.tmdb || movie.ids.kinopoisk));

                if (!id) {
                    console.error('Объект фильма:', movie);
                    throw new Error(`Не найден ID фильма (проверьте tmdb_id, kinopoisk_id)`);
                }

                // 3. Получение ссылки на поток
                const contentUrl = `https://reyohoho.github.io/reyohoho/${type}/${id}`;
                console.log('Запрос к:', contentUrl);
                
                const response = await fetch(contentUrl);
                if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
                
                const html = await response.text();
                const m3u8Url = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/)?.[0];
                
                if (!m3u8Url) throw new Error('Не найдена ссылка на поток');
                console.log("Найден поток:", m3u8Url);
                
                // 4. Запуск плеера
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
                Lampa.Noty.show('Ошибка при загрузке');
                
                // 5. Улучшенный fallback
                const movie = data?.movie || data?.item || data;
                const id = movie?.tmdb_id || movie?.kinopoisk_id || movie?.id;
                if (id) {
                    const type = movie.name ? 'tv' : 'movie';
                    const playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                    
                    Lampa.Player.play({
                        url: playerUrl,
                        title: movie.title || movie.name,
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
                <div class="selector__item selector-available" data-type="reyohoho">
                    <div class="selector__icon">
                        <svg width="24" height="24"><use xlink:href="#player"/></svg>
                    </div>
                    <div class="selector__title">ReYohoho</div>
                </div>
            `;
            
            const btn = $(button);
            btn.on('hover:enter', () => this.play(e.data));
            return btn;
        }
    };

    // Инициализация
    function init() {
        // Добавляем кнопку в интерфейс
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite' && e.data && e.object) {
                const container = e.object.activity.render().find('.selector__items');
                if (container.length) {
                    container.append(ReYohohoHandler.button(e));
                }
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
    }

    // Запуск плагина
    if (window.appready) init();
    else Lampa.Listener.follow('app', (e) => e.type === 'ready' && init());

    console.log('ReYohoho plugin initialized with ID fix');
})();
