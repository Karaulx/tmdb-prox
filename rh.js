$(document).ready(function() {
    // Функция для добавления кнопки
    function addButton() {
        const checkInterval = setInterval(() => {
            console.log('Пытаемся найти контейнер...');
            const buttonsContainer = $('.full-start__buttons');
            if (buttonsContainer.length) {
                clearInterval(checkInterval);
                console.log('Контейнер найден:', buttonsContainer);

                // Проверка, есть ли уже кнопка, чтобы не добавлять дубли
                if (buttonsContainer.find('.view--reyohoho').length) {
                    console.log('[ReYohoho] Кнопка уже существует');
                    return;
                }

                // Создаем кнопку HTML
                const buttonHTML = `
                    <div class="full-start__button view--reyohoho" style="cursor:pointer;">
                        <div class="full-start__button-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                        </div>
                        <div class="full-start__button-title">ReYohoho</div>
                    </div>
                `;

                const button = $(buttonHTML);

                // Обработка клика по кнопке
                button.on('click', function() {
                    const cardData = Lampa.Storage.get('card_data');
                    if (cardData) {
                        console.log('[ReYohoho] Запуск для:', cardData.title || cardData.name);
                        Lampa.Noty.show(`ReYohoho: ${cardData.title || cardData.name}`);
                    } else {
                        console.log('[ReYohoho] Нет данных card_data');
                    }
                });

                // Вставляем кнопку в контейнер
                buttonsContainer.append(button);
                console.log('[ReYohoho] Кнопка добавлена');
            } else {
                console.log('Контейнер не найден, повтор через 100мс...');
            }
        }, 100);
    }

    // Запускаем функцию с проверкой спустя некоторое время
    // если контейнер появляется позже
    addButton();

    // Также можно попробовать через задержку
    // setTimeout(addButton, 3000); // например, через 3 секунды
});
