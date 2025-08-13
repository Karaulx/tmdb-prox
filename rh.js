// Основной код плагина для rh.js
(function() {
    // Ждем полной загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log('Lampa loaded, initializing ReYohoho plugin');
        
        // Функция для безопасного получения данных контента
        function getCurrentItem() {
            try {
                // Пробуем разные методы получения данных
                return Lampa.Storage.get('current_item') || 
                       Lampa.Storage.get('card_data') ||
                       window.cardData ||
                       {};
            } catch (e) {
                console.error('Error getting item data:', e);
                return {};
            }
        }

        // Функция добавления кнопки
        function addButton() {
            // Удаляем старые кнопки
            $('.re-yohoho-button').remove();

            // Создаем кнопку с абсолютным позиционированием для теста
            const testButton = $(`
                <div class="re-yohoho-test-button" 
                     style="position: fixed;
                            bottom: 20px;
                            right: 20px;
                            padding: 10px;
                            background: #ff0000;
                            color: white;
                            z-index: 99999;
                            border-radius: 5px;">
                    TEST BUTTON
                </div>
            `);
            
            testButton.on('click', function() {
                const item = getCurrentItem();
                console.log('Current item data:', item);
                Lampa.Noty.show(`Testing: ${item.title || 'No title'}`);
            });
            
            $('body').append(testButton);
            console.log('Test button added');

            // Пробуем добавить кнопку в интерфейс
            setTimeout(() => {
                const container = $('.full-start__buttons, .card__buttons').first();
                if (container.length) {
                    const button = $(`
                        <div class="full-start__button selector re-yohoho-button" 
                             data-action="reyohoho"
                             style="border: 2px solid #00ff00;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#00ff00">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                            </svg>
                            <span>ReYohoho</span>
                        </div>
                    `);
                    
                    button.on('hover:enter', function() {
                        const item = getCurrentItem();
                        if (!item.id) {
                            Lampa.Noty.show('Данные не загружены, попробуйте позже');
                            return;
                        }
                        
                        const type = item.type === 'movie' ? 'movie' : 'tv';
                        const url = `https://reyohoho.github.io/reyohoho/${type}/${item.id}`;
                        
                        Lampa.Activity.push({
                            url: url,
                            component: 'full',
                            source: 'reyohoho'
                        });
                    });
                    
                    container.prepend(button);
                    testButton.remove();
                    console.log('Main button added to interface');
                }
            }, 1000);
        }

        // Инициализация с несколькими попытками
        let initAttempts = 0;
        const maxAttempts = 5;
        
        function tryInit() {
            initAttempts++;
            
            if ($('.full-start, .card--full').length) {
                addButton();
            } else if (initAttempts < maxAttempts) {
                setTimeout(tryInit, 1000);
            }
        }
        
        // Первая попытка
        tryInit();
        
        // Следим за изменениями интерфейса
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'start') tryInit();
        });
    });
})();
