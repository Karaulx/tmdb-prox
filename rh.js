function initReYohohoPlugin() {
    console.log('[ReYohoho] Plugin initialization started');

    function openReYohoho() {
        console.log('[ReYohoho] Button clicked');
        // Ваша логика для ReYohoho
    }

    function addReYohohoButton() {
        console.log('[ReYohoho] Trying to add button...');
        
        // 1. Проверка существования кнопки
        if ($('.re-yohoho-button').length > 0) return;
        
        // 2. Находим контейнер кнопок
        const buttonsContainer = $('.full-start__buttons');
        
        if (!buttonsContainer.length) {
            console.error('[ReYohoho] Buttons container (.full-start__buttons) not found!');
            return;
        }
        
        // 3. Создание кнопки ReYohoho
        const button = $(`
            <div class="full-start__button selector re-yohoho-button" 
                 data-action="open-reyohoho"
                 style="border: 2px solid #00ff00; background: rgba(0,255,0,0.1);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="#00ff00"/>
                </svg>
                <span style="color: #00ff00;">ReYohoho</span>
            </div>
        `);
        
        button.on('hover:enter', openReYohoho);
        
        // 4. Добавляем кнопку перед кнопкой "Трейлер"
        const trailerButton = buttonsContainer.find('.view--trailer');
        if (trailerButton.length) {
            trailerButton.before(button);
            console.log('[ReYohoho] Button added before Trailer button');
        } else {
            buttonsContainer.prepend(button);
            console.log('[ReYohoho] Button added to start of container');
        }
    }

    function setupCardEvents() {
        console.log('[ReYohoho] Setting up event listeners');
        
        // Основной триггер
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'start') {
                console.log('[ReYohoho] Full start event received');
                // Несколько попыток с разными задержками
                setTimeout(addReYohohoButton, 100);
                setTimeout(addReYohohoButton, 500);
                setTimeout(addReYohohoButton, 1000);
            }
        });
    }

    // Инициализация плагина
    if (window.appready) {
        console.log('[ReYohoho] App is ready');
        setupCardEvents();
        
        // Если карточка уже открыта при загрузке плагина
        if ($('.full-start').length) {
            console.log('[ReYohoho] Content card already open');
            setTimeout(addReYohohoButton, 300);
        }
    } else {
        console.log('[ReYohoho] Waiting for app ready');
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                console.log('[ReYohoho] App ready event received');
                setupCardEvents();
            }
        });
    }
}

// Защита от повторной загрузки
if (!window.reYohohoPluginLoaded) {
    window.reYohohoPluginLoaded = true;
    
    // Ожидание загрузки Lampa
    if (typeof Lampa !== 'undefined') {
        initReYohohoPlugin();
    } else {
        const checkLampa = setInterval(() => {
            if (typeof Lampa !== 'undefined') {
                clearInterval(checkLampa);
                initReYohohoPlugin();
            }
        }, 100);
    }
}
