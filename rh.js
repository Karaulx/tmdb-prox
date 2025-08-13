// Проверяем, что Lampa полностью загружена
if (typeof Lampa === 'undefined') {
    console.error('Lampa не обнаружена');
} else {
    console.log('Lampa обнаружена, инициализируем ReYohoho плагин');
    
    // Функция для обработки нажатия кнопки
    function handleReYohohoClick() {
        console.log('Кнопка ReYohoho нажата');
        
        const item = Lampa.Storage.get('current_item');
        if (!item || !item.id) {
            console.error('Не удалось получить данные контента');
            Lampa.Noty.show('Ошибка: данные не загружены', 'error');
            return;
        }

        const type = item.type === 'movie' ? 'movie' : 'tv';
        const reyohohoUrl = `https://reyohoho.github.io/reyohoho/${type}/${item.id}`;
        
        Lampa.Activity.push({
            url: reyohohoUrl,
            component: 'full',
            source: 'reyohoho'
        });
    }

    // Функция добавления кнопки с улучшенным поиском контейнера
    function addReYohohoButton() {
        console.log('Попытка добавить кнопку ReYohoho...');
        
        // Удаляем старые кнопки
        $('.re-yohoho-button').remove();

        // Создаем новую кнопку с яркими стилями для теста
        const button = $(`
            <div class="selector re-yohoho-button" 
                 style="position: fixed;
                        top: 50px;
                        right: 50px;
                        z-index: 99999;
                        padding: 12px;
                        background: #ff0000;
                        color: white;
                        font-size: 18px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                TEST ReYohoho
            </div>
        `);

        button.on('click', handleReYohohoClick);

        // Добавляем кнопку напрямую в body
        $('body').append(button);
        console.log('Тестовая кнопка добавлена в body');

        // Пробуем найти стандартный контейнер
        setTimeout(() => {
            const buttonsContainer = $('.full-start__buttons, .card__buttons').first();
            if (buttonsContainer.length) {
                console.log('Найден контейнер кнопок:', buttonsContainer[0]);
                
                // Создаем постоянную кнопку
                const permanentButton = $(`
                    <div class="full-start__button selector re-yohoho-button" 
                         data-action="reyohoho"
                         style="border: 2px solid #00ff00;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#00ff00">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                        </svg>
                        <span>ReYohoho</span>
                    </div>
                `);

                permanentButton.on('hover:enter', handleReYohohoClick);
                buttonsContainer.prepend(permanentButton);
                button.remove();
                console.log('Постоянная кнопка добавлена в контейнер');
            }
        }, 1000);
    }

    // Инициализация с несколькими попытками
    function initPlugin() {
        let attempts = 0;
        const maxAttempts = 5;
        
        const tryInit = () => {
            attempts++;
            console.log(`Попытка инициализации #${attempts}`);
            
            if (window.appready) {
                addReYohohoButton();
            } else if (attempts < maxAttempts) {
                setTimeout(tryInit, 1000);
            }
        };
        
        tryInit();
    }

    // Запускаем плагин
    initPlugin();

    // Дополнительная проверка через 5 секунд
    setTimeout(() => {
        if ($('.re-yohoho-button').length === 0) {
            console.warn('Кнопка не добавлена, последняя попытка');
            addReYohohoButton();
        }
    }, 5000);
}
