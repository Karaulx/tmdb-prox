(function() {
    'use strict';

    const RUDUB_URL = 'https://rudub.com'; // Замените на реальный URL
    const PLUGIN_NAME = 'RuDub Source';

    // 1. Добавляем RuDub в список источников
    Lampa.Player.addMethod({
        name: 'rudub',
        title: 'RuDub (дубляж)',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
        get: async function(item) {
            try {
                // Парсим страницу RuDub для поиска дубляжа
                const html = await Lampa.Request.text(`${RUDUB_URL}/search?q=${encodeURIComponent(item.title)}`);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Извлекаем ссылку на видео (адаптируйте под структуру RuDub)
                const videoUrl = doc.querySelector('.player-frame')?.src;
                if (!videoUrl) throw new Error('Видео не найдено');

                return [{
                    title: 'Дубляж RuDub',
                    file: videoUrl,
                    quality: 'HD',
                    type: 'mp4', // или 'hls' если используется потоковое вещание
                    headers: {
                        'Referer': RUDUB_URL
                    }
                }];
            } catch (e) {
                console.error(`[${PLUGIN_NAME}] Ошибка:`, e);
                return [];
            }
        }
    });

    console.log(`[${PLUGIN_NAME}] Плагин загружен`);
})();
