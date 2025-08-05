(function() {
    'use strict';

    // Конфигурация
    const PLUGIN_NAME = 'RuDub Search';
    const RUDUB_URL = 'https://rudub.com'; // Замените на реальный URL
    const SEARCH_PATH = '/search?q=';
    const CACHE_TIME = 3600; // 1 час кэширования

    // Регистрируем поисковый провайдер
    Lampa.Search.add({
        name: 'rudub',
        title: 'RuDub (без API)',
        type: ['movie', 'tv'],
        search: async function(query) {
            try {
                // 1. Получаем HTML страницы поиска
                const html = await Lampa.Request.text(`${RUDUB_URL}${SEARCH_PATH}${encodeURIComponent(query)}`);
                
                // 2. Создаем временный DOM для парсинга
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // 3. Извлекаем результаты (адаптируйте под структуру RuDub)
                const results = [];
                const items = doc.querySelectorAll('.search-result-item'); // Уточните селектор
                
                items.forEach(item => {
                    results.push({
                        id: item.querySelector('a').href.split('/').pop(),
                        title: item.querySelector('.title').textContent.trim(),
                        year: item.querySelector('.year')?.textContent || '',
                        type: item.classList.contains('movie') ? 'movie' : 'tv',
                        poster: item.querySelector('img')?.src || '',
                        voice: item.querySelector('.voice')?.textContent || 'Неизвестно'
                    });
                });
                
                return results;
            } catch (e) {
                console.error(`[${PLUGIN_NAME}] Ошибка поиска:`, e);
                return [];
            }
        }
    });

    console.log(`[${PLUGIN_NAME}] Плагин успешно загружен`);
})();
