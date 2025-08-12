function initReYohohoPlugin() {
    console.log('[ReYohoho] Plugin initialization started');
    
    function openReYohoho() {
        console.log('[ReYohoho] Button clicked');
        // Ваша логика для ReYohoho
    }

    function addReYohohoButton() {
        console.log('[ReYohoho] Trying to add button...');
        
        // 1. Основные альтернативные контейнеры для разных версий Lampa
        const containers = [
            '.full-start__buttons',    // Наиболее вероятный в новых версиях
            '.card__buttons',          // Стандартный контейнер
            '.full-buttons',           // Альтернативный вариант
            '.full__buttons',          // Еще один возможный вариант
            '.full-buttons__container' // Резервный
        ];
        
        let buttonsContainer = null;
        
        // Поиск первого существующего контейнера
        for (const selector of containers) {
            buttonsContainer = $(selector);
            if (buttonsContainer.length) {
                console.log(`[ReYohoho] Using container: ${selector}`);
                break;
            }
        }
        
        // 2. Если контейнер не найден - создаем его
        if (!buttonsContainer || !buttonsContainer.length) {
            console.warn('[ReYohoho] No container found - creating new');
            
            // Пробуем найти родительский элемент для размещения контейнера
            const parent = $('.full-start__body, .full__body, .card__body').first();
            
            if (parent.length) {
                buttonsContainer = $(`<div class="full-start__buttons"></div>`);
                parent.append(buttonsContainer);
                console.log('[ReYohoho] Created new buttons container');
            } else {
                console.error('[ReYohoho] ERROR: Cannot find parent for buttons container');
                return;
            }
        }
        
        // 3. Проверка существования кнопки
        if (buttonsContainer.find('.re-yohoho-button').length) {
            console.log('[ReYohoho] Button already exists');
            return;
        }
        
        // 4. Создание кнопки
        const button = $(`
            <div class="card__button selector re-yohoho-button" 
                 data-action="open-reyohoho">
                <div class="card__button-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L5.5 12L7 10.5L10 13.5L17 6.5L18.5 8L10 16.5Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="card__button-text">ReYohoho</div>
            </div>
        `);
        
        button.on('hover:enter', openReYohoho);
        
        // 5. Позиционирование кнопки
        const similarBtn = buttonsContainer.find('[data-action="similar"]');
        if (similarBtn.length) {
            similarBtn.before(button);
            console.log('[ReYohoho] Button added before "Similar"');
        } else {
            buttonsContainer.prepend(button);
            console.log('[ReYohoho] Button added to the start');
        }
    }

    // 6. Улучшенный обработчик событий
    function setupCardEvents() {
        console.log('[ReYohoho] Setting up event listeners');
        
        // Основной триггер для открытия карточки
        Lampa.Listener.follow('full', function(e){
            if (e.type === 'start') {
                console.log('[ReYohoho] Full start event received');
                
                // Несколько попыток на случай динамической загрузки
                setTimeout(addReYohohoButton, 300);
                setTimeout(addReYohohoButton, 1000);
                setTimeout(addReYohohoButton, 2000);
            }
        });
    }

    // 7. Инициализация плагина
    if (window.appready) {
        console.log('[ReYohoho] App is ready');
        setupCardEvents();
        
        // Проверка если карточка уже открыта
        if ($('.full-start, .card--full').length) {
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

// Запуск плагина
if (!window.reYohohoPluginLoaded) {
    window.reYohohoPluginLoaded = true;
    console.log('[ReYohoho] Loading plugin...');
    
    // Ожидание загрузки Lampa
    if (typeof Lampa !== 'undefined') {
        initReYohohoPlugin();
    } else {
        console.log('[ReYohoho] Waiting for Lampa...');
        let lampaCheck = setInterval(() => {
            if (typeof Lampa !== 'undefined') {
                clearInterval(lampaCheck);
                console.log('[ReYohoho] Lampa detected');
                initReYohohoPlugin();
            }
        }, 500);
    }
}
