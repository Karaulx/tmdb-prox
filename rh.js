(function() {
    'use strict';

    if (window.ReYohohoPluginReady) return;
    window.ReYohohoPluginReady = true;

    async function handleReYohohoPlay(data) {
        try {
            // 1. Универсальное получение данных
            const movie = data.movie || data;
            if (!movie) {
                console.error('Ошибка: Нет данных фильма', data);
                return;
            }

            // 2. Все возможные варианты ID
            const type = movie.name ? 'tv' : 'movie';
            const id = movie.tmdb_id || movie.kinopoisk_id || movie.id || 
                      (movie.ids && (movie.ids.tmdb || movie.ids.kinopoisk));

            if (!id) {
                console.error('Ошибка: Не найден ID у фильма', movie);
                Lampa.Noty.show('Ошибка: Нет ID фильма');
                return;
            }

            // 3. Получение ссылки
            const contentUrl = `https://reyohoho.github.io/reyohoho/${type}/${id}`;
            const response = await fetch(contentUrl);
            const html = await response.text();
            const m3u8Url = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/)?.[0];

            if (!m3u8Url) throw new Error('Не найдена ссылка на поток');

            // 4. Запуск плеера (оригинальный формат)
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
        }
    }

    // Инициализация (оригинальный рабочий вариант)
    function initPlugin() {
        // Добавляем кнопку в оригинальном стиле
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                const button = `
                    <div class="full-start__button view--reyohoho">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                        <span>ReYohoho</span>
                    </div>
                `;
                
                const btn = $(button);
                btn.on('hover:enter', function() {
                    handleReYohohoPlay(e.data);
                });
                
                // Оригинальное место вставки
                e.object.activity.render().find('.full-start__buttons').append(btn);
            }
        });

        // Регистрация обработчика
        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho',
                title: 'ReYohoho',
                priority: 10,
                handler: handleReYohohoPlay
            });
        }
    }

    // Запуск
    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type == 'ready' && initPlugin());

    console.log('ReYohoho plugin loaded (fixed ID handling)');
})();
