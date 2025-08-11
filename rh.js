(function() {
    'use strict';

    // Проверка на дублирование
    if (window.ReYohohoPluginInstalled) return;
    window.ReYohohoPluginInstalled = true;

    console.log('[ReYohoho] Plugin initialization');

    // Функция для добавления вашей кнопки
    function addMyButton() {
        const checkInterval = setInterval(() => {
            const buttonsContainer = $('.full-start__buttons');

            if (buttonsContainer.length) {
                clearInterval(checkInterval);

                // Проверяем, не добавлена ли уже кнопка
                if (buttonsContainer.find('.view--reyohoho').length) {
                    console.log('[ReYohoho] Button already exists');
                    return;
                }

                // Создаем кнопку
                const buttonHTML = `
                    <div class="full-start__button view--reyohoho" style="cursor:pointer; display:flex; align-items:center; padding:10px; background:#f0f0f0; border-radius:4px; margin-top:10px;">
                        <div class="full-start__button-icon" style="margin-right:8px;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                        </div>
                        <div class="full-start__button-title">ReYohoho</div>
                    </div>
                `;

                // Создаем элемент jQuery
                const button = $(buttonHTML).on('click', function() {
                    const cardData = Lampa.Storage.get('card_data');
                    if (cardData) {
                        console.log('[ReYohoho] Launching for:', cardData.title || cardData.name);
                        Lampa.Noty.show(`ReYohoho: ${cardData.title || cardData.name}`);
                        // Здесь добавьте основной функционал при клике
                    }
                });

                // Вставляем кнопку
                buttonsContainer.append(button);
                console.log('[ReYohoho] Button successfully added');
            }
        }, 100);
    }

    // Регистрация обработчика
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

    // Инициализация
    function init() {
        addMyButton();
        registerHandler();

        // Повторная попытка через 2 сек
        setTimeout(() => {
            if ($('.view--reyohoho').length === 0) {
                console.log('[ReYohoho] Retrying to add button');
                addMyButton();
            }
        }, 2000);
    }

    // Запуск при готовности
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }

    // Обновление интерфейса
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite' && $('.view--reyohoho').length === 0) {
            console.log('[ReYohoho] Full view updated, re-adding button');
            addMyButton();
        }
    });
})();
