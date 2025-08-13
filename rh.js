function addReYohohoButton() {
    // 1. Удаляем все возможные дубликаты
    $('.re-yohoho-button').remove();

    // 2. Точный целевой контейнер
    const targetContainer = $('.selectbox__body .scroll__content');
    
    if (!targetContainer.length) {
        console.error('Целевой контейнер не найден');
        return;
    }

    // 3. Создаем кнопку с уникальным идентификатором
    const button = $(`
        <div class="selectbox-item selectbox-item--icon selector re-yohoho-button" 
             data-reyohoho="true"
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

    // 4. Обработчик клика
    button.on('hover:enter', function() {
        console.log('ReYohoho activated');
        // Ваш функционал здесь
    });

    // 5. Точно позиционируем кнопку
    const firstTrailer = targetContainer.find('.selectbox-item').first();
    if (firstTrailer.length) {
        firstTrailer.before(button);
        console.log('✅ Кнопка добавлена перед первым трейлером');
    } else {
        targetContainer.prepend(button);
        console.log('⚠️ Кнопка добавлена в начало контейнера');
    }
}

// Умная инициализация с проверкой
function initReYohoho() {
    // Ожидаем полной загрузки интерфейса
    const checkInterval = setInterval(() => {
        if ($('.selectbox__body').length) {
            clearInterval(checkInterval);
            addReYohohoButton();
            
            // Дополнительная проверка через 1 сек
            setTimeout(() => {
                if ($('.re-yohoho-button').length !== 1) {
                    console.warn('Обнаружены дубликаты, очищаем...');
                    $('.re-yohoho-button').not(':first').remove();
                }
            }, 1000);
        }
    }, 300);
}

// Запуск
if (window.appready) {
    initReYohoho();
} else {
    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') initReYohoho();
    });
}
