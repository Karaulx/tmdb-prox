(function() {
    // Защита от повторной загрузки
    if (window.ReYohohoPluginV2Loaded) return;
    window.ReYohohoPluginV2Loaded = true;

    // Ждем полной загрузки Lampa (альтернатива Lampa.ready)
    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Player) {
            callback();
        } else {
            setTimeout(function() {
                waitForLampa(callback);
            }, 100);
        }
    }

    waitForLampa(function() {
        // Функция извлечения URL видео
        function extractVideoUrl(html) {
            try {
                // Ищем ссылки на видеофайлы
                const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
                const match = html.match(regex);
                return match ? match[0] : null;
            } catch (e) {
                return null;
            }
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
                
                // Формат вызова для Lampa 2.4.6
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
        try {
            if (Lampa.Player.handler && Lampa.Player.handler.add) {
                Lampa.Player.handler.add({
                    name: 'reyohoho',
                    priority: 10,
                    handler: handleReYohohoPlay
                });
                console.log('ReYohoho plugin успешно зарегистрирован');
            } else {
                console.error('Lampa.Player.handler.add не доступен');
            }
        } catch (e) {
            console.error('Ошибка регистрации плагина:', e);
        }
    });
})();
