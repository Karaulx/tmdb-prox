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
        
        // 2. Попробуем найти любой контейнер в карточке контента
        const possibleParents = [
            '.full-start__header',
            '.full-start__body',
            '.full-start__info',
            '.card__head',
            '.card__body'
        ];
        
        let parentContainer = null;
        
        for (const selector of possibleParents) {
            parentContainer = $(selector);
            if (parentContainer.length) {
                console.log(`[ReYohoho] Found parent: ${selector}`);
                break;
            }
        }
        
        // 3. Если не нашли стандартный контейнер - создаем в новом месте
        if (!parentContainer || !parentContainer.length) {
            console.warn('[ReYohoho] No standard parent found - using alternative location');
            
            // Попробуем найти заголовок
            const titleContainer = $('.full-start__title, .card__title').first();
            if (titleContainer.length) {
                parentContainer = titleContainer.parent();
            } else {
                console.error('[ReYohoho] ERROR: Cannot find any container for button');
                return;
            }
        }
        
        // 4. Создание кнопки с абсолютным позиционированием
        const button = $(`
            <div class="selector re-yohoho-button" 
                 style="position: absolute; top: 15px; right: 15px; z-index: 100;
                        background: rgba(0,0,0,0.7); border-radius: 4px; padding: 8px 12px;
                        display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="#00ff00"/>
                </svg>
                <span style="color: #00ff00; font-size: 14px;">ReYohoho</span>
            </div>
        `);
        
        button.on('hover:enter', openReYohoho);
        
        // 5. Добавляем кнопку прямо в найденный контейнер
        parentContainer.css('position', 'relative').append(button);
        console.log('[ReYohoho] Button added with absolute positioning');
    }

    // 6. Улучшенная система повторных попыток
    function tryAddButton() {
        setTimeout(() => {
            if (!$('.re-yohoho-button').length) {
                console.log('[ReYohoho] Retrying button addition...');
                addReYohohoButton();
                
                // Если все еще не добавлено - еще одна попытка
                if (!$('.re-yohoho-button').length) {
                    setTimeout(addReYohohoButton, 1000);
                }
            }
        }, 500);
    }

    function setupCardEvents() {
        console.log('[ReYohoho] Setting up event listeners');
        
        // Основной триггер
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'start') {
                console.log('[ReYohoho] Full start event received');
                tryAddButton();
            }
        });
        
        // Дополнительный триггер
        Lampa.Listener.follow('content', function(e) {
            if (e.type === 'data') {
                console.log('[ReYohoho] Content data event received');
                tryAddButton();
            }
        });
    }

    // 7. Инициализация плагина
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
    
    // Ожидание Lampa с таймаутом
    if (typeof Lampa !== 'undefined') {
        initReYohohoPlugin();
    } else {
        console.log('[ReYohoho] Waiting for Lampa...');
        let waitCount = 0;
        const waitInterval = setInterval(() => {
            waitCount++;
            if (typeof Lampa !== 'undefined') {
                clearInterval(waitInterval);
                console.log('[ReYohoho] Lampa detected');
                initReYohohoPlugin();
            } else if (waitCount > 10) { // 5 секунд таймаут
                clearInterval(waitInterval);
                console.error('[ReYohoho] Lampa not found after 5 seconds');
            }
        }, 500);
    }
        }
