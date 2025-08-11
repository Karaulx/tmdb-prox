(function() {
    'use strict';

    if (window.ReYohohoFinalPlugin) return;
    window.ReYohohoFinalPlugin = true;

    console.log('ReYohoho Final Plugin loading...');

    // 1. Проверенный метод добавления кнопки
    function addButton() {
        // Ждем готовности интерфейса
        const interval = setInterval(() => {
            const buttonsContainer = $('.full-start__buttons');
            if (buttonsContainer.length) {
                clearInterval(interval);
                
                // Создаем кнопку в ТОЧНОМ формате Lampa
                const button = `
                    <div class="full-start__button view--reyohoho">
                        <div class="full-start__button-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                        </div>
                        <div class="full-start__button-title">ReYohoho</div>
                    </div>
                `;
                
                // Добавляем с правильным обработчиком
                buttonsContainer.append($(button).on('hover:enter', () => {
                    const cardData = Lampa.Storage.get('card_data');
                    if (cardData) {
                        console.log('Запуск ReYohoho для:', cardData.title || cardData.name);
                        Lampa.Noty.show('ReYohoho: ' + (cardData.title || cardData.name));
                    }
                }));
                
                console.log('Кнопка ReYohoho успешно добавлена');
            }
        }, 100);
    }

    // 2. Альтернативная регистрация
    function registerHandler() {
        if (Lampa.Player?.addHandler) {
            Lampa.Player.addHandler({
                name: 'reyohoho',
                title: 'ReYohoho',
                priority: 15,
                handler: function(data) {
                    console.log('ReYohoho handler activated');
                    Lampa.Noty.show('ReYohoho запущен');
                }
            });
        }
    }

    // 3. Инициализация
    function init() {
        addButton();
        registerHandler();
        
        // Фикс для некоторых версий Lampa
        setTimeout(() => {
            if ($('.view--reyohoho').length === 0) {
                console.warn('Повторная попытка добавления кнопки');
                addButton();
            }
        }, 2000);
    }

    // Запуск
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }
})();
