(function() {
    'use strict';

    function startPlugin() {
        window.plugin_reyohoho_ready = true;

        function add() {
            // Добавляем красивую кнопку в интерфейс
            Lampa.Listener.follow('full', function(e) {
                if (e.type == 'complite') {
                    var button = `
                        <div class="full-start__button view--reyohoho">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                            <span>Смотреть на ReYohoho</span>
                        </div>`;
                    
                    var btn = $(button);
                    btn.on('hover:enter', function() {
                        handleReYohohoPlay(e.data);
                    });
                    
                    if (e.data && e.object) {
                        e.object.activity.render().find('.view--torrent').last().after(btn);
                    }
                }
            });

            // Функция обработки воспроизведения
          async function handleReYohohoPlay(data) {
    const movie = data.movie;
    const type = movie.name ? 'tv' : 'movie';
    const id = movie.tmdb_id || movie.kinopoisk_id;
    
    try {
        // Вариант 1: Прямая ссылка на видео
        const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
        
        const response = await fetch(contentUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const html = await response.text();
        const videoUrl = extractVideoUrl(html);
        
        if (!videoUrl) throw new Error('Ссылка на видео не найдена в HTML');
        
        Lampa.Player.play(videoUrl, {
            title: movie.title || movie.name,
            external: false,
            headers: {
                'Referer': contentUrl,
                'Origin': 'https://reyohoho.github.io'
            }
        });
        
    } catch (error) {
        console.error('ReYohoho error:', error);
        
        try {
            // Вариант 2: IFrame плеер с дополнительными параметрами
            const playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}&title=${encodeURIComponent(movie.title || movie.name)}`;
            
            Lampa.Player.play(playerUrl, {
                title: movie.title || movie.name,
                external: false,
                headers: {
                    'Referer': 'https://reyohoho.github.io/',
                    'Origin': 'https://reyohoho.github.io'
                }
            });
            
        } catch (fallbackError) {
            console.error('ReYohoho fallback error:', fallbackError);
            Lampa.Noty.show('Не удалось начать воспроизведение');
            
            // Вариант 3: Альтернативный источник, если доступен
            if (movie.video_url) {
                Lampa.Player.play(movie.video_url, {
                    title: movie.title || movie.name,
                    external: false
                });
            }
        }
    }
}

// Пример функции extractVideoUrl (адаптируйте под структуру страницы)
function extractVideoUrl(html) {
    // Попробуйте найти URL в HTML, например:
    const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
    const match = html.match(regex);
    return match ? match[0] : null;
}
                    
                    // Fallback: пытаемся открыть через iframe
                    const playerUrl = `https://reyohoho.github.io/player.html?id=${movie.tmdb_id || movie.kinopoisk_id}&type=${type}`;
                    Lampa.Player.play(playerUrl, {
                        title: movie.title || movie.name,
                        external: false
                    });
                }
            }

            // Функция извлечения ссылки на видео
            function extractVideoUrl(html) {
                // Ищем m3u8 ссылку
                const m3u8Match = html.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/i);
                if (m3u8Match) return m3u8Match[0];
                
                // Ищем iframe с видео
                const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
                if (iframeMatch) return iframeMatch[1];
                
                return null;
            }
        }

        // Запуск плагина
        if (window.appready) add(); 
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.plugin_reyohoho_ready) startPlugin();
})();
