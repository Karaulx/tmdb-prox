// Проверяем, что Lampa полностью загружена
(function() {
    // Ожидание загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log('Lampa loaded, initializing ReYohoho plugin');

        // 1. Функция для получения текущего контента с защитой от ошибок
        function getCurrentContent() {
            try {
                // Пробуем разные методы получения данных
                const item = Lampa.Storage.get('current_item') || 
                            Lampa.Storage.get('card_data') || 
                            {};
                
                // Если данных нет, пробуем получить из URL
                if (!item.id && window.location.pathname.includes('/movie/')) {
                    const id = window.location.pathname.split('/movie/')[1].split('/')[0];
                    if (id) return {id: id, type: 'movie'};
                }
                
                return item;
            } catch (e) {
                console.error('Error getting content:', e);
                return {};
            }
        }

        // 2. Функция добавления кнопки с улучшенным поиском контейнера
        function addReYohohoButton() {
            // Удаляем старые кнопки
            $('.re-yohoho-button').remove();

            // Создаем временную тестовую кнопку
            const testButton = $(`
                <div class="re-yohoho-test-button" 
                     style="position: fixed;
                            bottom: 20px;
                            right: 20px;
                            padding: 10px;
                            background: #ff0000;
                            color: white;
                            z-index: 99999;
                            border-radius: 5px;
                            font-size: 16px;">
                    TEST ReYohoho
                </div>
            `);
            
            testButton.on('click', function() {
                const item = getCurrentContent();
                console.log('Debug content data:', item);
                Lampa.Noty.show(`Content ID: ${item.id || 'none'}`);
            });
            
            $('body').append(testButton);

            // Основная кнопка
            function addMainButton() {
                const container = $('.full-start__buttons, .card__buttons, .full-buttons').first();
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
                        const item = getCurrentContent();
                        if (!item.id) {
                            Lampa.Noty.show('Не удалось получить данные контента', 'error');
                            return;
                        }
                        
                        const type = item.type === 'movie' ? 'movie' : 'tv';
                        const url = `https://reyohoho.github.io/reyohoho/${type}/${item.id}`;
                        
                        // Варианты открытия
                        new Lampa.Menu({
                            title: 'Выберите вариант',
                            items: [
                                {
                                    name: 'Открыть в ReYohoho',
                                    action: () => {
                                        Lampa.Activity.push({
                                            url: url,
                                            component: 'full',
                                            source: 'reyohoho'
                                        });
                                    }
                                },
                                {
                                    name: 'Открыть в браузере',
                                    action: () => {
                                        window.open(url, '_blank');
                                    }
                                }
                            ]
                        }).show();
                    });
                    
                    container.prepend(button);
                    testButton.remove();
                    console.log('Main ReYohoho button added');
                }
            }

            // Пробуем добавить основную кнопку несколько раз
            let attempts = 0;
            const buttonInterval = setInterval(() => {
                attempts++;
                if (attempts > 5) {
                    clearInterval(buttonInterval);
                    Lampa.Noty.show('Не удалось найти контейнер для кнопки', 'error');
                    return;
                }
                
                addMainButton();
                if ($('.re-yohoho-button').length) clearInterval(buttonInterval);
            }, 500);
        }

        // 3. Инициализация плагина
        function initPlugin() {
            // Первая попытка
            addReYohohoButton();
            
            // Следим за изменениями интерфейса
            Lampa.Listener.follow('full', function(e) {
                if (e.type === 'start') {
                    setTimeout(addReYohohoButton, 300);
                }
            });
            
            // Дополнительная проверка
            setTimeout(() => {
                if ($('.re-yohoho-button').length === 0) {
                    addReYohohoButton();
                }
            }, 3000);
        }

        // Запускаем
        if (window.appready) {
            initPlugin();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') initPlugin();
            });
        }
    });
})();
