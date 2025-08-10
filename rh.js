(function() {
    // Защита от повторной загрузки
    if (window.ReYohohoPluginLoaded) return;
    window.ReYohohoPluginLoaded = true;

    console.log('ReYohoho plugin init for Lampa 2.4.6');

    // Альтернатива Lampa.ready для старых версий
    function checkLampaAPI() {
        // Проверяем доступность нужных методов
        if (window.Lampa && window.Lampa.Player && window.Lampa.Player.addHandler) {
            initPlugin();
        } else if (window.Lampa && window.Lampa.Player && window.Lampa.Player.handler) {
            initPluginAlternative();
        } else {
            setTimeout(checkLampaAPI, 200);
        }
    }

    // Основная инициализация (для стандартного API)
    function initPlugin() {
        console.log('Инициализация через Lampa.Player.addHandler');
        
        Lampa.Player.addHandler({
            name: 'reyohoho',
            priority: 10,
            handler: handleReYohohoPlay
        });
    }

    // Альтернативная инициализация (для нестандартного API)
    function initPluginAlternative() {
        console.log('Инициализация через альтернативный метод');
        
        Lampa.Player.handler.add({
            name: 'reyohoho',
            priority: 10,
            handler: handleReYohohoPlay
        });
    }

    // Функция извлечения URL видео
    function extractVideoUrl(html) {
        try {
            // Улучшенное регулярное выражение для поиска видео
            const regex = /(https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4|mkv|webm)(?:\?[^\s"'<>]*)?)/i;
            const match = html.match(regex);
            return match ? match[0] : null;
        } catch (e) {
            return null;
        }
    }

    // Основной обработчик воспроизведения
    async function handleReYohohoPlay(data) {
        // Пропускаем если это не наш контент
        if (data.source && data.source === 'reyohoho') return false;
        
        console.log('ReYohoho обработчик запущен для:', data.movie);
        
        const movie = data.movie;
        const type = movie.name ? 'tv' : 'movie';
        const id = movie.tmdb_id || movie.kinopoisk_id;
        
        try {
            // Пробуем получить прямую ссылку
            const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
            console.log('Загрузка страницы:', contentUrl);
            
            const response = await fetch(contentUrl);
            if (!response.ok) throw new Error(`HTTP статус: ${response.status}`);
            
            const html = await response.text();
            const videoUrl = extractVideoUrl(html);
            
            if (!videoUrl) throw new Error('Видео URL не найден в HTML');
            
            console.log('Найден видео URL:', videoUrl);
            
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
            console.error('ReYohoho ошибка:', error);
            
            // Fallback вариант через iframe
            try {
                const playerUrl = `https://reyohoho.github.io/player.html?id=${id}&type=${type}`;
                console.log('Пробуем fallback через:', playerUrl);
                
                return Lampa.Player.play({
                    url: playerUrl,
                    title: movie.title || movie.name,
                    external: false,
                    source: 'reyohoho'
                });
            } catch (fallbackError) {
                console.error('ReYohoho fallback ошибка:', fallbackError);
                return false;
            }
        }
    }

    // Запускаем проверку API
    checkLampaAPI();
})();
