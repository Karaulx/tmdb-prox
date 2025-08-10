(function() {
    'use strict';

    if (window.ReYohohoPlugin) return;
    window.ReYohohoPlugin = true;

    async function handleReYohohoPlay(data) {
        // 1. Добавляем проверку данных
        if (!data?.movie) {
            console.error('Нет данных о фильме');
            return;
        }

        const movie = data.movie;
        const type = movie.name ? 'tv' : 'movie';
        const id = movie.tmdb_id || movie.kinopoisk_id;

        // 2. Проверка ID перед запросом
        if (!id) {
            console.error('ID фильма не найден:', movie);
            Lampa.Noty.show('Ошибка: не найден ID фильма');
            return;
        }

        try {
            const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
            console.log('Запрос к:', contentUrl); // Логируем URL
            
            const response = await fetch(contentUrl);
            if (!response.ok) throw new Error(`HTTP статус: ${response.status}`);
            
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
            console.error('ReYohoho error:', error);
            Lampa.Noty.show('Ошибка при загрузке');
            
            // Fallback с проверкой ID
            if (id) {
                const playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                Lampa.Player.play({
                    url: playerUrl,
                    title: movie.title || movie.name,
                    external: false
                });
            }
        }
    }

    // Инициализация для Lampa 2.4.6
    function init() {
        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho',
                title: 'ReYohoho',
                priority: 10,
                handler: handleReYohohoPlay
            });
            console.log('ReYohoho обработчик зарегистрирован');
        }
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
