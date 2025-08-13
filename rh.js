// ReYohoho Plugin v2 с точным определением ID
(function() {
    // 1. Конфигурация
    const config = {
        buttonPosition: 'bottom: 20px; right: 20px;', // Позиция кнопки
        buttonColor: '#00ff00', // Цвет кнопки
        debugMode: true // Режим отладки
    };

    // 2. Ждем готовности Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 200);
        }
    }

    waitForLampa(function() {
        console.log('[ReYohoho] Инициализация плагина');
        
        // 3. Точное определение ID контента
        function getExactContentId() {
            // Метод 1: Из URL (новый надежный способ)
            const path = window.location.pathname;
            let id, type;
            
            // Проверяем все возможные варианты URL
            const patterns = [
                {regex: /\/movie\/(\d+)/, type: 'movie'},
                {regex: /\/tv\/(\d+)/, type: 'tv'},
                {regex: /\/item\/(\d+)/, type: 'movie'},
                {regex: /\/film\/(\d+)/, type: 'movie'}
            ];
            
            for (const pattern of patterns) {
                const match = path.match(pattern.regex);
                if (match && match[1]) {
                    id = match[1];
                    type = pattern.type;
                    break;
                }
            }
            
            // Метод 2: Из данных Lampa (если есть)
            const storageData = Lampa.Storage.get('current_item') || {};
            
            // Приоритет: URL > Хранилище
            return {
                id: id || storageData.id,
                type: type || storageData.type,
                title: storageData.title || storageData.name || document.title.replace(' - Lampa', '')
            };
        }

        // 4. Создаем кнопку с улучшенной обработкой
        function createSmartButton() {
            const buttonHtml = `
                <div id="reyohoho-smart-button" 
                     style="position: fixed;
                            ${config.buttonPosition}
                            padding: 12px 16px;
                            background: ${config.buttonColor};
                            color: #000;
                            font-weight: bold;
                            border-radius: 8px;
                            z-index: 99999;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            cursor: pointer;
                            box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                    </svg>
                    ReYohoho
                </div>
            `;
            
            // Удаляем старую кнопку если есть
            $('#reyohoho-smart-button').remove();
            $('body').append(buttonHtml);
            
            // Обработчик клика
            $('#reyohoho-smart-button').on('click', function() {
                const content = getExactContentId();
                
                if (config.debugMode) {
                    console.group('[ReYohoho] Debug Information');
                    console.log('Content Data:', content);
                    console.log('URL:', window.location.href);
                    console.log('Lampa Storage:', Lampa.Storage.get('current_item'));
                    console.groupEnd();
                }
                
                if (!content.id) {
                    Lampa.Noty.show('Ошибка: ID контента не определен', 'error');
                    return;
                }
                
                const type = content.type || 'movie'; // По умолчанию movie
                const reyohohoUrl = `https://reyohoho.github.io/reyohoho/${type}/${content.id}`;
                
                // Открываем в новом окне
                window.open(reyohohoUrl, '_blank');
            });
            
            console.log('[ReYohoho] Smart button created');
        }

        // 5. Инициализация с несколькими попытками
        function init() {
            createSmartButton();
            
            // Дополнительные попытки для динамического контента
            const retryInterval = setInterval(() => {
                if ($('#reyohoho-smart-button').length === 0) {
                    createSmartButton();
                }
            }, 1000);
            
            // Остановка через 10 секунд
            setTimeout(() => clearInterval(retryInterval), 10000);
        }

        // Запуск
        init();
    });
})();
