(function() {
    'use strict';

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
        // 1. Альтернативные селекторы для поиска контейнера
        const containerSelectors = [
            '.full-start__buttons', // Основной селектор
            '.full-start__controls', // Возможный родительский контейнер
            '.full-start' // Самый внешний контейнер
        ];

        let buttonsContainer;
        for (const selector of containerSelectors) {
            buttonsContainer = document.querySelector(selector);
            if (buttonsContainer) break;
        }

        // Если контейнер не найден, используем более глубокий поиск
        if (!buttonsContainer) {
            buttonsContainer = document.querySelector('.full-start .full-start__buttons');
        }

        // Если контейнер все еще не найден, создаем его
        if (!buttonsContainer) {
            console.warn('Контейнер не найден, создаем новый');
            buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'full-start__buttons';
            const fullStart = document.querySelector('.full-start');
            if (fullStart) {
                fullStart.appendChild(buttonsContainer);
            } else {
                console.error('Не удалось найти .full-start');
                return;
            }
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

        // 4. Вставляем кнопку в контейнер
        buttonsContainer.insertAdjacentHTML('beforeend', buttonHTML);

        // 5. Добавляем обработчик события
        const reyohohoButton = buttonsContainer.querySelector('.view--reyohoho');
        reyohohoButton.addEventListener('click', handleReYohohoClick);
        reyohohoButton.addEventListener('hover:enter', handleReYohohoClick);
        
        console.log('Кнопка ReYohoho успешно добавлена');
    }

    // Инициализация плагина
    function initPlugin() {
        // Пытаемся добавить кнопку сразу
        addReYohohoButton();
        
        // Отслеживаем изменения DOM на случай динамической загрузки
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes) {
                    for (const node of mutation.addedNodes) {
                        if (node.classList && (
                            node.classList.contains('full-start') || 
                            node.classList.contains('full-start__buttons') ||
                            node.querySelector('.full-start__buttons')
                        )) {
                            addReYohohoButton();
                            return;
                        }
                    }
                }
            }
        });
        
        // Начинаем наблюдение
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Дополнительная проверка через 3 секунды
        setTimeout(() => {
            if (!document.querySelector('.view--reyohoho')) {
                console.log('Повторная попытка добавления кнопки');
                addReYohohoButton();
            }
        }, 3000);
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
