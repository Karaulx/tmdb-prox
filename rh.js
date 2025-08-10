(function() {
    // Проверяем, не зарегистрирован ли уже плагин
    if (window.ReYohohoPluginLoaded) return;
    window.ReYohohoPluginLoaded = true;

    // Функция извлечения URL видео из HTML
    function extractVideoUrl(html) {
        // Ищем прямую ссылку на видеофайл
        const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
        const match = html.match(regex);
        return match ? match[0] : null;
    }

    // Основная функция обработки воспроизведения
    async function handleReYohohoPlay(data) {
        // Если это не наш источник, пропускаем
        if (data.source && data.source !== 'reyohoho') return false;
        
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
            
            Lampa.Player.play({
                url: videoUrl,
                title: movie.title || movie.name,
                external: false,
                source: 'reyohoho', // Помечаем наш источник
                headers: {
                    'Referer': contentUrl,
                    'Origin': 'https://reyohoho.github.io'
                }
            });
            
            return true; // Останавливаем другие обработчики
            
        } catch (error) {
            console.error('ReYohoho direct play error:', error);
            
            try {
                // Вариант 2: IFrame плеер
                const playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}&title=${encodeURIComponent(movie.title || movie.name)}`;
                
                Lampa.Player.play({
                    url: playerUrl,
                    title: movie.title || movie.name,
                    external: false,
                    source: 'reyohoho'
                });
                
                return true;
                
            } catch (fallbackError) {
                console.error('ReYohoho fallback error:', fallbackError);
                return false; // Позволяем другим обработчикам попробовать
            }
        }
    }

    // Регистрируем наш обработчик с высоким приоритетом
    Lampa.Player.addHandler({
        name: 'reyohoho',
        priority: 10, // Высокий приоритет
        handler: handleReYohohoPlay
    });

    console.log('ReYohoho plugin loaded successfully');
})();
