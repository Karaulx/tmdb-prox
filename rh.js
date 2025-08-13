// ReYohoho Plugin для Lampa с поддержкой параметров URL
(function() {
    // 1. Конфигурация
    const config = {
        buttonColor: '#00ff00',
        debugMode: true
    };

    // 2. Получаем параметры из URL
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            id: params.get('card'),
            type: params.get('media') === 'tv' ? 'tv' : 'movie'
        };
    }

    // 3. Создаем диагностическую кнопку
    function createButton() {
        const params = getUrlParams();
        const debugInfo = {
            urlParams: params,
            storage: Lampa.Storage.get('current_item') || {},
            path: window.location.pathname
        };

        const button = $(`
            <div id="reyohoho-btn" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px;
                background: ${config.buttonColor};
                color: #000;
                font-weight: bold;
                border-radius: 8px;
                z-index: 99999;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                gap: 8px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                ReYohoho
            </div>
        `);

        button.on('click', function() {
            if (!params.id) {
                console.error('[ReYohoho] Debug info:', debugInfo);
                Lampa.Noty.show('ID не найден. Проверьте консоль (F12)', 'error');
                return;
            }

            const url = `https://reyohoho.github.io/reyohoho/${params.type}/${params.id}`;
            window.open(url, '_blank');
        });

        $('body').append(button);
        console.log('[ReYohoho] Кнопка создана с параметрами:', params);
    }

    // 4. Инициализация
    function init() {
        // Первая попытка
        createButton();
        
        // Повторная попытка через 1 секунду
        setTimeout(createButton, 1000);
    }

    // Запускаем при загрузке
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
