// ReYohoho Plugin для Lampa (финальная версия)
(function() {
    // 1. Конфигурация
    const config = {
        buttonText: 'ReYohoho',
        buttonColor: '#00ff00',
        debugMode: true
    };

    // 2. Получаем ID и тип из URL
    function getContentData() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('card') || params.get('id');
        const type = params.get('media') === 'tv' ? 'tv' : 'movie';
        
        return {
            id: id,
            type: id ? type : undefined,
            source: 'url_params'
        };
    }

    // 3. Создаем кнопку с улучшенной обработкой
    function createButton() {
        const content = getContentData();
        
        // Диагностическая информация
        if (config.debugMode) {
            console.group('[ReYohoho] Debug Info');
            console.log('URL Params:', new URLSearchParams(window.location.search).toString());
            console.log('Content Data:', content);
            console.log('Lampa Storage:', Lampa.Storage.get('current_item'));
            console.groupEnd();
        }

        // Создаем HTML кнопки
        const button = $(`
            <div id="reyohoho-final-button" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 16px;
                background: ${config.buttonColor};
                color: #000;
                font-weight: bold;
                border-radius: 8px;
                z-index: 99999;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                font-family: Arial, sans-serif;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                ${config.buttonText}
            </div>
        `);

        // Обработчик клика
        button.on('click', function() {
            if (!content.id) {
                Lampa.Noty.show('Ошибка: ID контента не найден', 'error');
                return;
            }

            const url = `https://reyohoho.github.io/reyohoho/${content.type}/${content.id}`;
            if (config.debugMode) console.log('[ReYohoho] Opening URL:', url);
            
            window.open(url, '_blank');
        });

        // Добавляем кнопку
        $('body').append(button);
        console.log('[ReYohoho] Кнопка создана');
    }

    // 4. Инициализация с защитой от ошибок
    function initPlugin() {
        try {
            // Ждем готовности DOM
            if (document.readyState === 'complete') {
                createButton();
            } else {
                window.addEventListener('load', createButton);
            }
            
            // Дополнительная попытка через 1 секунду
            setTimeout(createButton, 1000);
        } catch (e) {
            console.error('[ReYohoho] Init error:', e);
        }
    }

    // Запускаем плагин
    if (typeof Lampa !== 'undefined') {
        initPlugin();
    } else {
        const checkLampa = setInterval(() => {
            if (typeof Lampa !== 'undefined') {
                clearInterval(checkLampa);
                initPlugin();
            }
        }, 200);
    }
})();
