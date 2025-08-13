// ReYohoho Plugin для Lampa
(function() {
    // 1. Ждем загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 200);
        }
    }

    waitForLampa(function() {
        console.log('[ReYohoho] Lampa detected, starting plugin');
        
        // 2. Функция диагностики - собираем все возможные данные
        function debugInfo() {
            const info = {
                // Основные хранилища
                storage: {
                    current_item: Lampa.Storage.get('current_item'),
                    card_data: Lampa.Storage.get('card_data'),
                    last_card: Lampa.Storage.get('last_card')
                },
                
                // URL страницы
                url: {
                    full: window.location.href,
                    path: window.location.pathname,
                    id: null,
                    type: null
                },
                
                // DOM элементы
                elements: {
                    buttons_container: $('.full-start__buttons').length,
                    card_title: $('.card__title, .full-start__title').text().trim(),
                    body_class: document.body.className
                }
            };

            // Парсим ID и тип из URL
            const urlMatch = window.location.pathname.match(/\/(movie|tv)\/(\d+)/);
            if (urlMatch) {
                info.url.type = urlMatch[1];
                info.url.id = urlMatch[2];
            }

            return info;
        }

        // 3. Получаем ID контента всеми возможными способами
        function getContentId() {
            const debug = debugInfo();
            console.log('[ReYohoho] Debug info:', debug);
            
            // Пробуем получить ID из разных источников
            const idSources = [
                debug.storage.current_item?.id,
                debug.storage.card_data?.id,
                debug.storage.last_card?.id,
                debug.url.id
            ];
            
            for (const id of idSources) {
                if (id && !isNaN(id)) return id;
            }
            
            return null;
        }

        // 4. Создаем кнопку с гарантированным отображением
        function createButton() {
            const buttonId = 'reyohoho-fixed-button';
            
            // Удаляем старую кнопку если есть
            $(`#${buttonId}`).remove();

            // Создаем кнопку
            const button = $(`
                <div id="${buttonId}" 
                     style="position: fixed;
                            bottom: 20px;
                            right: 20px;
                            padding: 12px 16px;
                            background: #00ff00;
                            color: #000;
                            font-weight: bold;
                            border-radius: 8px;
                            z-index: 99999;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            cursor: pointer;
                            box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                    </svg>
                    ReYohoho
                </div>
            `);

            // Обработчик клика
            button.on('click', function() {
                const contentId = getContentId();
                const debug = debugInfo();
                
                if (!contentId) {
                    Lampa.Noty.show(`Не удалось получить ID. Проверьте консоль (F12)`, 'error');
                    console.error('[ReYohoho] Не могу определить ID контента. Полные данные:', debug);
                    return;
                }
                
                // Определяем тип контента
                const type = debug.storage.current_item?.type || 
                              debug.storage.card_data?.type || 
                              (window.location.pathname.includes('/tv/') ? 'tv' : 'movie');
                
                const url = `https://reyohoho.github.io/reyohoho/${type}/${contentId}`;
                console.log('[ReYohoho] Opening URL:', url);
                
                window.open(url, '_blank');
            });

            // Добавляем кнопку на страницу
            $('body').append(button);
            console.log('[ReYohoho] Button created with fixed positioning');
        }

        // 5. Инициализация плагина
        function initPlugin() {
            // Создаем кнопку сразу
            createButton();
            
            // Дополнительные попытки (на случай динамической загрузки контента)
            setTimeout(createButton, 1000);
            setTimeout(createButton, 3000);
            
            // Можно добавить слежение за изменениями, но для простоты ограничимся таймаутами
        }

        // Запускаем плагин
        initPlugin();
    });
})();
