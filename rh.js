// Полный обновленный код с отладочной информацией
function initReYohohoPlugin() {
    console.log('[ReYohoho] Plugin initialization started');
    
    function openReYohoho() {
        console.log('[ReYohoho] Button clicked');
        // Ваша логика для ReYohoho
    }

    function addReYohohoButton() {
        console.log('[ReYohoho] Trying to add button...');
        
        // 1. Альтернативные селекторы для контейнера кнопок
        const buttonsContainer = $('.card__buttons:first, .full-start__buttons:first, .full-buttons__container:first');
        
        if (buttonsContainer.length) {
            console.log('[ReYohoho] Buttons container found');
            
            // 2. Проверка существования кнопки
            if (buttonsContainer.find('.re-yohoho-button').length) {
                console.log('[ReYohoho] Button already exists');
                return;
            }
            
            // 3. Создание кнопки с более заметными стилями
            const button = $(`
                <div class="card__button selector re-yohoho-button" 
                     data-action="open-reyohoho"
                     style="border: 1px solid #00ff00;">
                    <div class="card__button-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="#00ff00"/>
                        </svg>
                    </div>
                    <div class="card__button-text" style="color: #00ff00;">ReYohoho</div>
                </div>
            `);
            
            button.on('hover:enter', openReYohoho);
            
            // 4. Пробуем разные позиции для вставки
            const similarBtn = buttonsContainer.find('[data-action="similar"]');
            if (similarBtn.length) {
                similarBtn.before(button);
                console.log('[ReYohoho] Button added before "Similar"');
            } else {
                buttonsContainer.append(button);
                console.log('[ReYohoho] Button added to the end');
            }
        } else {
            console.error('[ReYohoho] ERROR: Buttons container not found!');
            console.error('Available containers:', $('.card, .full, .full-start, .full-buttons'));
        }
    }

    function setupCardEvents() {
        console.log('[ReYohoho] Setting up event listeners');
        
        // 5. Несколько триггеров для активации
        Lampa.Listener.follow('content', function(e){
            if (e.type === 'item') {
                console.log('[ReYohoho] Content item event received');
                setTimeout(addReYohohoButton, 500);
            }
        });
        
        // Дополнительный триггер
        Lampa.Listener.follow('full', function(e){
            if (e.type === 'start') {
                console.log('[ReYohoho] Full start event received');
                setTimeout(addReYohohoButton, 700);
            }
        });
    }

    // 6. Проверка готовности приложения
    if (window.appready) {
        console.log('[ReYohoho] App is ready');
        setupCardEvents();
        
        // Проверка если карточка уже открыта
        if ($('.card--full, .full-start').length) {
            console.log('[ReYohoho] Content card already open');
            setTimeout(addReYohohoButton, 1000);
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

// 7. Запуск плагина с защитой
if (!window.reYohohoPluginLoaded) {
    window.reYohohoPluginLoaded = true;
    console.log('[ReYohoho] Loading plugin...');
    
    // Проверка наличия Lampa
    if (typeof Lampa !== 'undefined') {
        initReYohohoPlugin();
    } else {
        console.log('[ReYohoho] Waiting for Lampa...');
        document.addEventListener('lampa-loaded', function() {
            console.log('[ReYohoho] Lampa loaded event received');
            initReYohohoPlugin();
        });
    }
}
