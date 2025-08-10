(function() {
    'use strict';

    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    const ReYohohoHandler = {
        play: async function(data) {
            try {
                // 1. Получаем ID из разных возможных источников
                const movie = data.movie || data.item || data;
                const type = movie.name ? 'tv' : 'movie';
                
                // 2. Расширенная проверка ID (включая дополнительные поля)
                const id = movie.tmdb_id || movie.kinopoisk_id || movie.id || 
                          (movie.ids && (movie.ids.tmdb || movie.ids.kinopoisk));
                
                if (!id) {
                    console.error('Movie data:', movie);
                    throw new Error('Не найден ID фильма (проверьте tmdb_id, kinopoisk_id)');
                }

                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                console.log('ReYohoho запрос:', contentUrl);
                
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
                
                // Fallback только если есть ID
                const movie = data.movie || data.item || data;
                const id = movie.tmdb_id || movie.kinopoisk_id || movie.id;
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

        // ... остальные обработчики (menu, button) без изменений ...
    };

    // ... остальная часть кода без изменений ...
})();
