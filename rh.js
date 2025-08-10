(function() {
    // Проверяем, что Lampa загружена
    if (!window.Lampa) {
        console.error('Lampa не обнаружена!');
        return;
    }

    // Ожидаем полной загрузки API
    Lampa.ready(function() {
        // Защита от повторной загрузки
        if (window.ReYohohoPluginLoaded) return;
        window.ReYohohoPluginLoaded = true;

        // Функция извлечения URL видео
        function extractVideoUrl(html) {
            // Ищем ссылки на m3u8 или mp4
            const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
            const match = html.match(regex);
            return match ? match[0] : null;
        }

        // Основной обработчик
        async function handleReYohohoPlay(data) {
            // Пропускаем если это не наш контент
            if (data.source && data.source === 'reyohoho') return false;
            
            const movie = data.movie;
            const type = movie.name ? 'tv' : 'movie';
            const id = movie.tmdb_id || movie.kinopoisk_id;
            
            try {
                // Пробуем получить прямую ссылку
                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                const response = await fetch(contentUrl);
                if (!response.ok) throw new Error('Ошибка загрузки страницы');
                
                const html = await response.text();
                const videoUrl = extractVideoUrl(html);
                if (!videoUrl) throw new Error('Видео URL не найден');
                
                // В Lampa 2.4.6 используется такой формат
                return Lampa.Player.play({
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
                return false;
            }
        }

        // Регистрация обработчика для Lampa 2.4.6
        if (typeof Lampa.Player.addHandler === 'function') {
            Lampa.Player.addHandler({
                name: 'reyohoho',
                priority: 10,
                handler: handleReYohohoPlay
            });
        } else {
            // Альтернативный способ для старых версий
            Lampa.Player.handler.add({
                name: 'reyohoho',
                priority: 10,
                handler: handleReYohohoPlay
            });
        }

        console.log('ReYohoho plugin для Lampa 2.4.6 успешно загружен');
    });
})();
