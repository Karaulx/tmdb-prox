function addReYohohoButton() {
    // 1. Находим контейнер кнопок (точный селектор из вашего HTML)
    const buttonsContainer = $('.full-start__buttons');
    
    if (!buttonsContainer.length) {
        console.error('[ReYohoho] Контейнер кнопок не найден');
        return;
    }

    // 2. Проверяем, не добавлена ли кнопка ранее
    if (buttonsContainer.find('.re-yohoho-button').length > 0) return;

    // 3. Создаем кнопку в стиле Lampa
    const button = $(`
        <div class="full-start__button selector re-yohoho-button" 
             data-action="open-reyohoho"
             style="border: 1px solid rgba(255,255,255,0.2);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="currentColor"/>
            </svg>
            <span>ReYohoho</span>
        </div>
    `);

    button.on('hover:enter', function() {
        console.log('[ReYohoho] Кнопка нажата');
        // Ваш код для ReYohoho
    });

    // 4. Вставляем перед кнопкой "Трейлер" (если есть)
    const trailerBtn = buttonsContainer.find('.view--trailer');
    if (trailerBtn.length) {
        trailerBtn.before(button);
        console.log('[ReYohoho] Кнопка добавлена перед "Трейлер"');
    } else {
        buttonsContainer.prepend(button);
        console.log('[ReYohoho] Кнопка добавлена в начало контейнера');
    }
}
