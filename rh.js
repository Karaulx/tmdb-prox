function addReYohohoButton() {
    // 1. Находим контейнер с трейлерами
    const trailerContainer = $('.selectbox-body .scroll_content');
    
    if (!trailerContainer.length) {
        console.error('Контейнер трейлеров не найден!');
        return;
    }

    // 2. Создаем кнопку ReYohoho в стиле других элементов
    const reYohohoButton = $(`
        <div class="selectbox-item selection-item-icon selector re-yohoho-button" 
             style="border-left: 3px solid #00ff00;">
            <div class="selectbox-item_icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#00ff00">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z"/>
                </svg>
            </div>
            <div class="selectbox-item_title">ReYohoho</div>
            <div class="selectbox-item_subtitle">Альтернативный плеер</div>
        </div>
    `);

    // 3. Добавляем обработчик клика
    reYohohoButton.on('hover:enter', function() {
        console.log('ReYohoho запущен');
        // Ваш код для запуска ReYohoho
    });

    // 4. Вставляем кнопку в начало списка
    trailerContainer.prepend(reYohohoButton);
    console.log('Кнопка ReYohoho добавлена');
}

// Инициализация при загрузке плеера
if (window.appready) {
    addReYohohoButton();
} else {
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            setTimeout(addReYohohoButton, 500);
        }
    });
}
