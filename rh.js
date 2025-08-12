function addReYohohoButton() {
    // 1. Удаляем старую кнопку (если есть)
    $('.re-yohoho-button').remove();

    // 2. Яркий маркер контейнера (временно)
    const buttonsContainer = $('.full-start__buttons')
        .css('outline', '3px solid #00ff00')
        .css('position', 'relative');

    if (!buttonsContainer.length) {
        console.error('❌ Контейнер кнопок не найден! Доступные элементы:');
        console.log($('.full-start > *').get());
        return;
    }

    // 3. Создаем ОЧЕНЬ заметную кнопку
    const button = $(`
        <div class="re-yohoho-button" 
             style="position: absolute;
                    top: 0;
                    left: 0;
                    width: 200px;
                    height: 50px;
                    background: #FF0000 !important;
                    color: white !important;
                    font-size: 20px !important;
                    z-index: 99999 !important;
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                    border: 3px dashed yellow !important;">
            🔴 TEST BUTTON
        </div>
    `);

    // 4. Добавляем в тело документа (на время теста)
    $('body').append(button);

    // 5. Постепенно перемещаем к нужному месту
    setTimeout(() => {
        button.css({
            'position': 'static',
            'width': 'auto',
            'height': 'auto',
            'background': '',
            'border': '',
            'font-size': ''
        });
        
        // Пытаемся вставить в контейнер
        const trailerBtn = buttonsContainer.find('.view--trailer');
        if (trailerBtn.length) {
            trailerBtn.before(button);
            console.log('✅ Кнопка добавлена перед "Трейлер"');
        } else {
            buttonsContainer.prepend(button);
            console.log('⚠️ Кнопка добавлена в начало контейнера');
        }
        
        // Финальный стиль
        button.attr('class', 'full-start__button selector re-yohoho-button')
              .html(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="currentColor"/>
                </svg>
                <span>ReYohoho</span>
              `);
    }, 1000);
                }
