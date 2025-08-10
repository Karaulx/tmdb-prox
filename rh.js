(function() {
    'use strict';

    if (window.ReYohohoPluginReady) return;
    window.ReYohohoPluginReady = true;

    function initPlugin() {
        // Главный обработчик
        async function handleReYohohoPlay(data) {
            try {
                // 1. Универсальное получение данных фильма
                const movie = data.movie || data;
                if (!movie) throw new Error('Нет данных о фильме');

                // 2. Все возможные варианты ID
                const id = movie.tmdb_id || movie.kinopoisk_id || movie.id;
                if (!id) throw new Error('Не найден ID фильма');

                const type = movie.name ? 'tv' : 'movie';
                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                
                const response = await fetch(contentUrl);
                const html = await response.text();
                const videoUrl = html.match(/(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i)?.[0];
                
                Lampa.Player.play({
                    url: videoUrl || `https://reyohoho.github.io/player.html?id=${id}&type=${type}`,
                    title: movie.title || movie.name,
                    external: false,
                    source: 'reyohoho'
                });

            } catch (error) {
                console.error('ReYohoho error:', error);
                Lampa.Noty.show('Ошибка ReYohoho');
            }
        }

        // Добавление кнопки в интерфейс (исправленный вариант)
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                const button = `
                    <div class="selector__item selector-available" data-type="reyohoho">
                        <div class="selector__icon">
                            <svg width="24" height="24"><use xlink:href="#player"/></svg>
                        </div>
                        <div class="selector__title">ReYohoho</div>
                    </div>
                `;
                
                const container = e.object.activity.render().find('.selector__items');
                if (container.length) {
                    container.append($(button).on('hover:enter', () => handleReYohohoPlay(e.data)));
                }
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

    // Запуск плагина
    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type == 'ready' && initPlugin());

    console.log('ReYohoho plugin loaded');
})();
