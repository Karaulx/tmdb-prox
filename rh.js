$(document).ready(function() {
    console.log('Документ готов. Начинаем отслеживание появления .full-start__buttons.');

    function insertButton() {
        const buttonsContainer = $('.full-start__buttons');
        if (buttonsContainer.length) {
            console.log('Контейнер найден:', buttonsContainer);

            // Проверка, чтобы не добавлять кнопку повторно
            if (buttonsContainer.find('.view--reyohoho').length) {
                console.log('Кнопка уже существует.');
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
            console.log('Кнопка добавлена.');
        } else {
            console.log('Контейнер .full-start__buttons еще не найден.');
        }
    }

    // Используем MutationObserver для отслеживания появления элемента
    const observer = new MutationObserver((mutations, obs) => {
        if ($('.full-start__buttons').length) {
            console.log('.full-start__buttons появился в DOM.');
            insertButton();
            // Можно отключить наблюдение после нахождения
            obs.disconnect();
        }
    });

    // Начинаем наблюдение за всем документом
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Также можно добавить задержку на всякий случай
    setTimeout(() => {
        if (!$('.full-start__buttons').length) {
            console.log('Пробуем вставить кнопку через задержку.');
            insertButton();
        }
    }, 5000); // 5 секунд задержки
});
