// Добавляем кнопку ReYohoho в карточку контента
function initReYohohoPlugin() {
    // Функция для открытия ReYohoho
    function openReYohoho() {
        // Здесь будет логика открытия ReYohoho
        console.log('ReYohoho opened for:', Lampa.Storage.get('current_item', {}));
    }

    // Функция добавления кнопки в карточку
    function addReYohohoButton() {
        // Находим контейнер кнопок в карточке контента
        const buttonsContainer = $('.card__buttons:first');
        
        if (buttonsContainer.length && !buttonsContainer.find('.re-yohoho-button').length) {
            // Создаем кнопку ReYohoho
            const button = $(`
                <div class="card__button selector re-yohoho-button" data-action="open-reyohoho">
                    <div class="card__button-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="card__button-text">ReYohoho</div>
                </div>
            `);
            
            button.on('hover:enter', function(e){
                e.preventDefault();
                openReYohoho();
            });
            
            // Вставляем кнопку перед кнопкой "Похожее"
            buttonsContainer.find('[data-action="similar"]').before(button);
        }
    }

    // Обработчик событий карточки
    function setupCardEvents() {
        Lampa.Listener.follow('content', function(e){
            if (e.type === 'item') {
                // Карточка контента открыта
                setTimeout(addReYohohoButton, 300); // Задержка для гарантированной загрузки
            }
        });
    }

    // Инициализация плагина
    if (window.appready) {
        setupCardEvents();
        // Если карточка уже открыта
        if ($('.card--full').length) {
            setTimeout(addReYohohoButton, 500);
        }
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setupCardEvents();
            }
        });
    }
}

// Защита от повторной инициализации
if (!window.reYohohoPluginLoaded) {
    window.reYohohoPluginLoaded = true;
    initReYohohoPlugin();
}
