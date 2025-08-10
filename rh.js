(function() {
    // Проверка на повторную загрузку
    if (window.ReYohohoPlugin) return;
    window.ReYohohoPlugin = true;

    // Ожидаем загрузки Lampa (аналог Lampa.ready для 2.4.6)
    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Player) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        // Оригинальная функция извлечения URL
        function extractVideoUrl(html) {
            const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
            const match = html.match(regex);
            return match ? match[0] : null;
        }

        // Оригинальный обработчик из первого кода
        async function handleReYohohoPlay(data) {
            const movie = data.movie;
            const type = movie.name ? 'tv' : 'movie';
            const id = movie.tmdb_id || movie.kinopoisk_id;
            
            try {
                // Оригинальный URL-формат
                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                
                const response = await fetch(contentUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const html = await response.text();
                const videoUrl = extractVideoUrl(html);
                
                if (!videoUrl) throw new Error('Ссылка на видео не найдена в HTML');
                
                // Оригинальный вызов плеера
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
                
                // Оригинальный fallback
                const playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                Lampa.Player.play(playerUrl, {
                    title: movie.title || movie.name,
                    external: false
                });
            }
        }

        // Регистрация обработчика (адаптация для 2.4.6)
        if (Lampa.Player.addHandler) {
            Lampa.Player.addHandler({
                name: 'reyohoho',
                priority: 10,
                handler: handleReYohohoPlay
            });
        } else if (Lampa.Player.handler && Lampa.Player.handler.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho',
                priority: 10,
                handler: handleReYohohoPlay
            });
        } else {
            console.error('Не удалось зарегистрировать обработчик в Lampa 2.4.6');
        }
    });
})();
