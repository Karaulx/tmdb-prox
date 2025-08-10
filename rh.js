(function() {
    'use strict';

    // Защита от повторной загрузки
    if (window.ReYohohoPluginReady) return;
    window.ReYohohoPluginReady = true;

    function initPlugin() {
        // Основная функция воспроизведения (ваш оригинальный код)
        async function handleReYohohoPlay(data) {
            const movie = data.movie;
            const type = movie.name ? 'tv' : 'movie';
            
            try {
                const contentUrl = `https://reyohoho.github.io/${type}/${movie.tmdb_id || movie.kinopoisk_id}`;
                const html = await fetch(contentUrl).then(r => r.text());
                const videoUrl = extractVideoUrl(html);
                
                if (!videoUrl) throw new Error('Ссылка на видео не найдена');
                
                Lampa.Player.play(videoUrl, {
                    title: movie.title || movie.name,
                    external: false,
                    headers: {
                        'Referer': 'https://reyohoho.github.io/',
                        'Origin': 'https://reyohoho.github.io'
                    }
                });
                
            } catch (error) {
                console.error('ReYohoho error:', error);
                Lampa.Noty.show('Не удалось начать воспроизведение');
                
                const playerUrl = `https://reyohoho.github.io/player.html?id=${movie.tmdb_id || movie.kinopoisk_id}&type=${type}`;
                Lampa.Player.play(playerUrl, {
                    title: movie.title || movie.name,
                    external: false
                });
            }
        }

        function extractVideoUrl(html) {
            const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
            const match = html.match(regex);
            return match ? match[0] : null;
        }

        // Добавляем кнопку в интерфейс (аналогично torrents)
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                const button = `
                    <div class="full-start__button view--reyohoho">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                        <span>ReYohoho</span>
                    </div>
                `;
                
                const btn = $(button);
                btn.on('hover:enter', function() {
                    handleReYohohoPlay(e.data);
                });
                
                if (e.data && e.object) {
                    e.object.activity.render().find('.full-start__buttons').append(btn);
                }
            }
        });

        // Регистрируем обработчик плеера
        Lampa.Player.addHandler({
            name: 'reyohoho',
            title: 'ReYohoho',
            priority: 10,
            handler: handleReYohohoPlay
        });

        // Добавляем настройки (если нужно)
        Lampa.SettingsApi.addParam({
            component: 'reyohoho',
            param: {
                name: 'reyohoho_enabled',
                type: 'select',
                values: ['true', 'false'],
                value: 'true'
            },
            field: {
                name: 'Включить ReYohoho',
                description: 'Активировать источник ReYohoho'
            }
        });
    }

    // Запускаем плагин
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                initPlugin();
            }
        });
    }
})();
