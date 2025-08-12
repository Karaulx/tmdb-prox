(function() {
    'use strict';

    // Защита от повторной загрузки
    if (window.ReYohohoButtonAdded) return;
    window.ReYohohoButtonAdded = true;

    console.log('ReYohoho plugin initialization');

    // Основная функция для теста
    function handleReYohohoClick() {
        const cardData = Lampa.Storage.get('card_data');
        if (cardData) {
            const title = cardData.title || cardData.name || 'Unknown';
            Lampa.Noty.show(`ReYohoho: ${title}`);
            console.log('Card data:', cardData);
        }
    }

    // Функция добавления кнопки
    function addReYohohoButton() {
        // 1. Находим контейнер кнопок
        const buttonsContainer = document.querySelector('.full-start__buttons');
        if (!buttonsContainer) {
            console.log('Контейнер кнопок не найден, повторная попытка через 500мс');
            setTimeout(addReYohohoButton, 500);
            return;
        }

        // 2. Проверяем, не добавлена ли кнопка уже
        if (buttonsContainer.querySelector('.view--reyohoho')) {
            console.log('Кнопка уже добавлена');
            return;
        }

        // 3. Создаем кнопку по образцу из исходников
        const buttonHTML = `
            <div class="full-start__button selector view--reyohoho">
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" 
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" 
                          fill="currentColor"></path>
                </svg>
                <span>ReYohoho</span>
            </div>
        `;

        // 4. Вставляем кнопку перед кнопкой настроек
        const optionsButton = buttonsContainer.querySelector('.button--options');
        if (optionsButton) {
            optionsButton.insertAdjacentHTML('beforebegin', buttonHTML);
        } else {
            buttonsContainer.insertAdjacentHTML('beforeend', buttonHTML);
        }

        // 5. Добавляем обработчик события
        const reyohohoButton = buttonsContainer.querySelector('.view--reyohoho');
        reyohohoButton.addEventListener('hover:enter', handleReYohohoClick);
        
        console.log('Кнопка ReYohoho успешно добавлена');
    }

    // Инициализация плагина
    function initPlugin() {
        // Запускаем добавление кнопки
        addReYohohoButton();
        
        // Дополнительная проверка через 2 секунды
        setTimeout(() => {
            if (!document.querySelector('.view--reyohoho')) {
                console.log('Повторная попытка добавления кнопки');
                addReYohohoButton();
            }
        }, 2000);
    }

    // Запуск после загрузки Lampa
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
