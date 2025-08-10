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
