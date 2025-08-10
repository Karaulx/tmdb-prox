(function() {
    // Проверка на повторную загрузку
    if (window.ReYohohoPluginV3) return;
    window.ReYohohoPluginV3 = true;

    console.log('ReYohoho plugin loading for Lampa 2.4.6...');

    // Функция ожидания загрузки Lampa
    function waitForLampa(callback, attempts = 0) {
        if (window.Lampa && window.Lampa.Player) {
            callback();
        } else if (attempts < 10) {
            setTimeout(() => waitForLampa(callback, attempts + 1), 300);
        } else {
            console.error('Lampa API не загрузилось после 10 попыток');
        }
    }

    waitForLampa(function() {
        // Функция извлечения URL видео (оригинальная)
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
                const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
                console.log('Fetching:', contentUrl);
                
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

        // Специальная регистрация для Lampa 2.4.6
        try {
            // Попытка 1: Стандартный метод
            if (typeof Lampa.Player.addHandler === 'function') {
                Lampa.Player.addHandler({
                    name: 'reyohoho',
                    priority: 10,
                    handler: handleReYohohoPlay
                });
                console.log('Обработчик зарегистрирован через addHandler');
            }
            // Попытка 2: Альтернативный метод для 2.4.6
            else if (Lampa.Player.handler && typeof Lampa.Player.handler.add === 'function') {
                Lampa.Player.handler.add({
                    name: 'reyohoho',
                    priority: 10,
                    handler: handleReYohohoPlay
                });
                console.log('Обработчик зарегистрирован через handler.add');
            }
            // Попытка 3: Прямое добавление в массив обработчиков
            else if (Array.isArray(Lampa.Player.handlers)) {
                Lampa.Player.handlers.push({
                    name: 'reyohoho',
                    priority: 10,
                    handler: handleReYohohoPlay
                });
                console.log('Обработчик добавлен напрямую в handlers array');
            } else {
                console.error('Не найдено ни одного способа регистрации обработчика');
                return;
            }
            
            console.log('ReYohoho plugin успешно загружен!');
        } catch (e) {
            console.error('Ошибка регистрации плагина:', e);
        }
    });
})();
