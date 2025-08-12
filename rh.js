function initReYohohoPlugin() {
    console.log('[ReYohoho] Plugin initialization started');

    function openReYohoho() {
        console.log('[ReYohoho] Button clicked');
        // Ваша логика для ReYohoho
    }

    function addReYohohoButton() {
        console.log('[ReYohoho] Trying to add button...');
        
        // Проверка существования кнопки
        if ($('.re-yohoho-button').length > 0) {
            console.log('[ReYohoho] Button already exists');
            return;
        }
        
        // Создание кнопки с более заметными стилями
        const button = $(`
            <div class="selector re-yohoho-button" 
                 style="position: absolute; 
                        top: 50px; 
                        right: 50px; 
                        z-index: 10000;
                        background: #ff0000; 
                        border: 3px solid yellow; 
                        border-radius: 8px; 
                        padding: 12px 16px;
                        display: flex; 
                        align-items: center; 
                        gap: 10px;
                        box-shadow: 0 0 20px rgba(255,255,0,0.8);">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="#ffffff"/>
                </svg>
                <span style="color: #ffffff; font-size: 18px; font-weight: bold;">ReYohoho</span>
            </div>
        `);
        
        button.on('hover:enter', openReYohoho);
        
        // Добавляем кнопку непосредственно в body
        $('body').append(button);
        console.log('[ReYohoho] Button added to body with absolute positioning');
        
        // Анимация для привлечения внимания
        button.css('transform', 'scale(1.2)');
        setTimeout(() => button.css('transform', 'scale(1)'), 500);
    }

    // Усиленная система повторов
    function tryAddButton() {
        setTimeout(() => {
            if (!$('.re-yohoho-button').length) {
                console.log('[ReYohoho] Retrying button addition...');
                addReYohohoButton();
            }
        }, 500);
    }

    function setupCardEvents() {
        console.log('[ReYohoho] Setting up event listeners');
        
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'start') {
                console.log('[ReYohoho] Full start event received');
                tryAddButton();
            }
        });
        
        Lampa.Listener.follow('content', function(e) {
            if (e.type === 'data') {
                console.log('[ReYohoho] Content data event received');
                tryAddButton();
            }
        });
    }

    // Инициализация плагина
    if (window.appready) {
        console.log('[ReYohoho] App is ready');
        setupCardEvents();
        
        if ($('.full-start, .card--full').length) {
            console.log('[ReYohoho] Content card already open');
            tryAddButton();
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

// Запуск плагина
if (!window.reYohohoPluginLoaded) {
    window.reYohohoPluginLoaded = true;
    console.log('[ReYohoho] Loading plugin...');
    
    // Ожидание Lampa
    if (typeof Lampa !== 'undefined') {
        initReYohohoPlugin();
    } else {
        console.log('[ReYohoho] Waiting for Lampa...');
        let waitCount = 0;
        const waitInterval = setInterval(() => {
            if (typeof Lampa !== 'undefined') {
                clearInterval(waitInterval);
                console.log('[ReYohoho] Lampa detected');
                initReYohohoPlugin();
            } else if (waitCount++ > 20) { // 10 секунд таймаут
                clearInterval(waitInterval);
                console.error('[ReYohoho] Lampa not found after 10 seconds');
            }
        }, 500);
    }
}
