(function() {
    'use strict';

    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    const ReYohohoHandler = {
        play: async function(data) {
            try {
                // 1. Улучшенная проверка данных
                const movie = data?.movie || data?.item || data;
                if (!movie) {
                    console.error('No movie data:', data);
                    throw new Error('Данные о фильме не получены');
                }

                // 2. Поддержка разных форматов ID
                const type = movie.name ? 'tv' : 'movie';
                const id = movie.tmdb_id || movie.kinopoisk_id || movie.id || 
                         (movie.ids && (movie.ids.tmdb || movie.ids.kinopoisk));

                if (!id) {
                    console.error('Movie object:', movie);
                    throw new Error('Не найден ID фильма (tmdb_id/kinopoisk_id)');
                }

                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                console.log('Fetching ReYohoho:', contentUrl);
                
                const response = await fetch(contentUrl);
                if (!response.ok) throw new Error(`Ошибка ${response.status}`);
                
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
                Lampa.Noty.show('Ошибка при загрузке');
                
                // 3. Улучшенный fallback с проверкой
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

        // ... остальные методы (menu, button) без изменений ...
    };

    // ... остальная часть кода без изменений ...
})();
