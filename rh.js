// ReYohoho Plugin для Lampa (финальная исправленная версия)
(function() {
    // 1. Конфигурация
    const config = {
        buttonText: 'ReYohoho',
        buttonColor: '#00ff00',
        debugMode: true
    };

    // 2. Получаем точные данные контента
    function getExactContentData() {
        // Параметры из URL
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('card') || params.get('id');
        const urlType = params.get('media') === 'tv' ? 'tv' : 'movie';
        
        // Данные из TMDB API (из логов)
        let tmdbId, tmdbType;
        const apiMatch = window.location.href.match(/tmdb\.org\/3\/(movie|tv)\/(\d+)/);
        if (apiMatch) {
            tmdbType = apiMatch[1];
            tmdbId = apiMatch[2];
        }
        
        // Приоритет: TMDB API > URL параметры
        return {
            id: tmdbId || urlId,
            type: tmdbType || urlType,
            source: tmdbId ? 'tmdb_api' : 'url_params'
        };
    }

    // 3. Создаем кнопку с правильным URL
    function createButton() {
        const content = getExactContentData();
        
        // Диагностика
        if (config.debugMode) {
            console.group('[ReYohoho] Точные данные:');
            console.log('Контент:', content);
            console.log('Текущий URL:', window.location.href);
            console.log('TMDB API вызовы:', performance.getEntries().filter(e => e.name.includes('themoviedb')));
            console.groupEnd();
        }

        // Создаем кнопку
        const button = $(`
            <div id="reyohoho-pro-button" style="
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
                box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                ${config.buttonText}
            </div>
        `);

        // Обработчик клика
        button.on('click', function() {
            if (!content.id) {
                Lampa.Noty.show('Ошибка: ID контента не определен', 'error');
                return;
            }

            // Фикс: правильный тип контента
            const finalType = content.type || 'movie';
            const url = `https://reyohoho.github.io/reyohoho/${finalType}/${content.id}`;
            
            if (config.debugMode) {
                console.log('[ReYohoho] Final URL:', url);
            }
            
            window.open(url, '_blank');
        });

        $('body').append(button);
        console.log('[ReYohoho] Профессиональная кнопка создана');
    }

    // 4. Умная инициализация
    function init() {
        // Ждем завершения API-запросов TMDB
        setTimeout(() => {
            createButton();
            
            // Дополнительная проверка через 2 секунды
            setTimeout(() => {
                if (!getExactContentData().id) {
                    console.warn('[ReYohoho] Данные не получены, повторная попытка');
                    createButton();
                }
            }, 2000);
        }, 500);
    }

    // Запуск
    if (typeof Lampa !== 'undefined') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
