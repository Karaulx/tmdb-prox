(function() {
    'use strict';

    // Проверка на дублирование
    if (window.ReYohohoPluginInstalled) return;
    window.ReYohohoPluginInstalled = true;

    console.log('[ReYohoho] Plugin initialization');

    // Функция для добавления кнопки ReYohoho
    function addReYohohoButton() {
        const checkInterval = setInterval(() => {
            const buttonsContainer = $('.full-start__buttons');
            
            if (buttonsContainer.length) {
                clearInterval(checkInterval);
                
                if (buttonsContainer.find('.view--reyohoho').length) {
                    console.log('[ReYohoho] Button already exists');
                    return;
                }

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

                const button = $(buttonHTML).on('hover:enter', function() {
                    const cardData = Lampa.Storage.get('card_data');
                    if (cardData) {
                        console.log('[ReYohoho] Launching for:', cardData.title || cardData.name);
                        Lampa.Noty.show(`ReYohoho: ${cardData.title || cardData.name}`);
                    }
                });

                buttonsContainer.append(button);
                console.log('[ReYohoho] Button successfully added');
            }
        }, 100);
    }

    // Функция для добавления кнопки Кинопоиска
    function addKinopoiskButton() {
        const checkInterval = setInterval(() => {
            const buttonsContainer = $('.full-start__buttons');
            
            if (buttonsContainer.length) {
                clearInterval(checkInterval);
                
                if (buttonsContainer.find('.view--kinopoisk').length) {
                    console.log('[Kinopoisk] Button already exists');
                    return;
                }

                const buttonHTML = `
                    <div class="full-start__button view--kinopoisk">
                        <div class="full-start__button-icon">
                            <svg width="24" height="24" viewBox="0 0 239 239" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">
                                <path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z"/>
                                <path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z"/>
                                <path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="full-start__button-title">Кинопоиск</div>
                    </div>
                `;

                const button = $(buttonHTML).on('hover:enter', function() {
                    if (Lampa.Storage.get('kinopoisk_access_token', '') === '') {
                        Lampa.Noty.show('Для доступа к Кинопоиску требуется авторизация');
                    } else {
                        Lampa.Activity.push({
                            url: '',
                            title: 'Кинопоиск',
                            component: 'kinopoisk',
                            page: 1
                        });
                    }
                });

                buttonsContainer.append(button);
                console.log('[Kinopoisk] Button successfully added');
            }
        }, 100);
    }

    // Дополнительная регистрация обработчика для ReYohoho
    function registerReYohohoHandler() {
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
        addReYohohoButton();
        addKinopoiskButton();
        registerReYohohoHandler();
        
        // Дополнительная проверка через 2 секунды
        setTimeout(() => {
            if ($('.view--reyohoho').length === 0) {
                console.log('[ReYohoho] Retrying to add button');
                addReYohohoButton();
            }
            if ($('.view--kinopoisk').length === 0) {
                console.log('[Kinopoisk] Retrying to add button');
                addKinopoiskButton();
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

    // Следим за обновлениями интерфейса
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            if ($('.view--reyohoho').length === 0) {
                console.log('[ReYohoho] Full view updated, re-adding button');
                addReYohohoButton();
            }
            if ($('.view--kinopoisk').length === 0) {
                console.log('[Kinopoisk] Full view updated, re-adding button');
                addKinopoiskButton();
            }
        }
    });
})();
