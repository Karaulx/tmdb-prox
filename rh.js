(function() {
    'use strict';

    // Проверка на дублирование
    if (window.ReYohohoPluginInstalled) return;
    window.ReYohohoPluginInstalled = true;

    console.log('[ReYohoho] Plugin initialization');

    // Основная функция добавления кнопки
    function addButton() {
        // Ждем появления контейнера кнопок
        const checkInterval = setInterval(() => {
            const buttonsContainer = $('.full-start__buttons');
            
            if (buttonsContainer.length) {
                clearInterval(checkInterval);
                
                // Проверяем, не добавлена ли уже кнопка
                if (buttonsContainer.find('.view--reyohoho').length) {
                    console.log('[ReYohoho] Button already exists');
                    return;
                }

                // Создаем кнопку по аналогии с рабочим плагином
                const buttonHTML = `
                    <div class="full-start__button view--reyohoho">
                        <div class="full-start__button-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                        </div>
                        <div class="full-start__button-title">ReYohoho</div>
                    </div>
                `;

                // Добавляем кнопку в контейнер
                const button = $(buttonHTML).on('hover:enter', function() {
                    const cardData = Lampa.Storage.get('card_data');
                    if (cardData) {
                        console.log('[ReYohoho] Launching for:', cardData.title || cardData.name);
                        Lampa.Noty.show(`ReYohoho: ${cardData.title || cardData.name}`);
                        // Здесь будет основной функционал
                    }
                });

                // Вставляем кнопку в правильное место (как в рабочем плагине)
                buttonsContainer.append(button);
                console.log('[ReYohoho] Button successfully added');
            }
        }, 100);
    }

    // Дополнительная регистрация обработчика
    function registerHandler() {
        if (Lampa.Player && Lampa.Player.addHandler) {
            Lampa.Player.addHandler({
                name: 'reyohoho',
                title: 'ReYohoho',
                priority: 15,
                handler: function(data) {
                    console.log('[ReYohoho] Player handler activated');
                    Lampa.Noty.show('ReYohoho запущен');
                }
            });
        }
    }

    // Инициализация плагина
    function init() {
        addButton();
        registerHandler();
        
        // Дополнительная проверка через 2 секунды
        setTimeout(() => {
            if ($('.view--reyohoho').length === 0) {
                console.log('[ReYohoho] Retrying to add button');
                addButton();
            }
        }, 2000);
    }

    // Запуск плагина
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }

    // Следим за обновлениями интерфейса (как в рабочем плагине)
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite' && $('.view--reyohoho').length === 0) {
            console.log('[ReYohoho] Full view updated, re-adding button');
            addButton();
        }
    });
})();
