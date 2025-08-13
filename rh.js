(function() {
    // 1. Ожидание полной загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage && window.Lampa.Listener) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 200);
        }
    }

    waitForLampa(function() {
        console.log('Lampa loaded, starting ReYohoho plugin');
        
        // 2. Функция для получения ID контента из URL
        function extractIdFromUrl() {
            const path = window.location.pathname;
            const patterns = [
                /\/movie\/(\d+)/,
                /\/tv\/(\d+)/,
                /\/item\/(\d+)/,
                /\/film\/(\d+)/
            ];
            
            for (const pattern of patterns) {
                const match = path.match(pattern);
                if (match && match[1]) return match[1];
            }
            return null;
        }

        // 3. Получение данных контента
        function getContentData() {
            try {
                // Основные методы получения данных
                const storageItem = Lampa.Storage.get('current_item') || 
                                   Lampa.Storage.get('card_data') || 
                                   {};
                
                // Если в хранилище нет ID, пробуем из URL
                if (!storageItem.id) {
                    const id = extractIdFromUrl();
                    if (id) {
                        return {
                            id: id,
                            type: window.location.pathname.includes('/tv/') ? 'tv' : 'movie',
                            title: document.title.replace(/ - Lampa$/, '')
                        };
                    }
                }
                
                return storageItem;
            } catch (e) {
                console.error('Error getting content:', e);
                return {};
            }
        }

        // 4. Добавление кнопки с гарантированным отображением
        function addButton() {
            // Удаляем старые кнопки
            $('.re-yohoho-button').remove();

            // Получаем данные
            const item = getContentData();
            console.log('Content data:', item);

            // Создаем кнопку с абсолютным позиционированием
            const button = $(`
                <div class="re-yohoho-button" 
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
                            gap: 8px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                    </svg>
                    ReYohoho
                </div>
            `);

            // Обработчик клика
            button.on('click', function() {
                if (!item.id) {
                    Lampa.Noty.show('ID контента не найден', 'error');
                    return;
                }

                const type = item.type === 'movie' ? 'movie' : 'tv';
                const url = `https://reyohoho.github.io/reyohoho/${type}/${item.id}`;
                
                Lampa.Activity.push({
                    url: url,
                    component: 'full',
                    source: 'reyohoho',
                    title: item.title || 'ReYohoho'
                });
            });

            // Добавляем кнопку
            $('body').append(button);
            console.log('ReYohoho button added');

            // Дополнительно пробуем найти стандартный контейнер
            setTimeout(() => {
                const container = $('.full-start__buttons, .card__buttons, .full-buttons').first();
                if (container.length) {
                    const mainButton = $(`
                        <div class="full-start__button selector re-yohoho-button" 
                             data-action="reyohoho"
                             style="border: 2px solid #00ff00;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#00ff00">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                            </svg>
                            <span>ReYohoho</span>
                        </div>
                    `);
                    
                    mainButton.on('hover:enter', function() {
                        button.trigger('click');
                    });
                    
                    container.prepend(mainButton);
                }
            }, 500);
        }

        // 5. Инициализация плагина
        function init() {
            // Первая попытка
            addButton();
            
            // Следим за изменениями
            Lampa.Listener.follow('full', function(e) {
                if (e.type === 'start') setTimeout(addButton, 300);
            });
            
            // Периодическая проверка
            const checkInterval = setInterval(() => {
                if ($('.re-yohoho-button').length === 0) {
                    addButton();
                }
            }, 3000);
            
            // Остановка через 15 секунд
            setTimeout(() => clearInterval(checkInterval), 15000);
        }

        // Запуск
        if (window.appready) {
            init();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') init();
            });
        }
    });
})();
