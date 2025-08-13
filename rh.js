function addReYohohoButton() {
    // 1. Находим контейнер с элементами трейлеров
    const trailersContainer = $('.scroll__content');
    
    if (!trailersContainer.length) {
        console.error('Контейнер трейлеров не найден!');
        return;
    }

    // 2. Создаем кнопку ReYohoho в едином стиле
    const reYohohoButton = $(`
        <div class="selectbox-item selectbox-item--icon selector re-yohoho-button" 
             style="border-left: 3px solid #00ff00; margin-bottom: 15px;">
            <div class="selectbox-item__icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#00ff00">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z"/>
                </svg>
            </div>
            <div>
                <div class="selectbox-item__title" style="color: #00ff00">ReYohoho</div>
                <div class="selectbox-item__subtitle">Альтернативный плеер</div>
            </div>
        </div>
    `);

    // 3. Добавляем обработчик клика
    reYohohoButton.on('hover:enter', function() {
        console.log('ReYohoho запущен');
        // Ваш код для запуска ReYohoho
        // Например: Lampa.Player.play(reYohohoUrl);
    });

    // 4. Вставляем кнопку ПЕРВОЙ в списке
    trailersContainer.prepend(reYohohoButton);
    console.log('✅ Кнопка ReYohoho добавлена в начало списка');

    // 5. Временно подсвечиваем контейнер для проверки (удалите в финальной версии)
    trailersContainer.css('outline', '2px dashed rgba(0,255,0,0.5)');
}

// Автоматическая инициализация
if (window.appready) {
    addReYohohoButton();
} else {
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // Задержка для полной загрузки интерфейса
            setTimeout(addReYohohoButton, 800);
        }
    });
}
