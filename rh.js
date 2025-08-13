// Lampa-ReYohoho Bridge (исправленная версия)
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true,
        maxRetries: 3 // Максимальное количество попыток получения данных
    };

    // Ожидаем загрузки Lampa
    function waitForLampa(callback, attempts = 0) {
        if (window.Lampa && window.Lampa.Storage && window.Lampa.Player) {
            callback();
        } else if (attempts < 30) { // 30 попыток (3 секунды)
            setTimeout(() => waitForLampa(callback, attempts + 1), 100);
        } else {
            console.error("[Lampa-ReYohoho] Lampa API не загрузилось");
        }
    }

    waitForLampa(function() {
        console.log("[Lampa-ReYohoho] Инициализация");

        // 🔄 Улучшенное получение данных из TMDB
        function getTmdbData(retry = 0) {
            try {
                // 1. Пробуем получить данные через Lampa.Storage
                const item = Lampa.Storage.get('current_item') || {};
                
                // 2. Если данных нет, парсим DOM
                if (!item.title && !item.name) {
                    const titleElement = document.querySelector('.card__title, .full-start__title, .player__title');
                    const yearElement = document.querySelector('.card__year, .full-start__year, .player__year');
                    const posterElement = document.querySelector('.card__poster, .full-start__poster, .player__poster img');
                    
                    item.title = titleElement?.textContent?.trim() || '';
                    item.name = item.title; // Для совместимости
                    item.year = parseInt(yearElement?.textContent) || new Date().getFullYear();
                    item.poster = posterElement?.src || posterElement?.getAttribute('data-src') || '';
                    
                    // Определяем тип контента (фильм/сериал)
                    const path = window.location.pathname;
                    item.type = path.includes('/tv/') ? 'tv' : 'movie';
                }

                // 3. Если название так и не найдено, пробуем ещё раз (если попытки не исчерпаны)
                if (!item.title && !item.name && retry < config.maxRetries) {
                    console.log(`[Lampa-ReYohoho] Повторная попытка получения данных (${retry + 1})`);
                    return new Promise(resolve => 
                        setTimeout(() => resolve(getTmdbData(retry + 1)), 500)
                    );
                }

                // 4. Если данные получены — возвращаем их
                if (item.title || item.name) {
                    return {
                        id: item.id,
                        type: item.type,
                        title: item.title || item.name,
                        year: item.year,
                        poster: item.poster || item.cover || ''
                    };
                } else {
                    console.error("[Lampa-ReYohoho] Данные не найдены");
                    return null;
                }
            } catch (e) {
                console.error("[Lampa-ReYohoho] Ошибка получения данных:", e);
                return null;
            }
        }

        // 🎬 Создаём кнопку в интерфейсе
        function createButton() {
            const buttonId = 'reyohoho-bridge-btn';
            
            // Удаляем старую кнопку, если есть
            const oldButton = document.getElementById(buttonId);
            if (oldButton) oldButton.remove();

            const button = document.createElement('div');
            button.id = buttonId;
            button.innerHTML = `
                <style>
                    #${buttonId} {
                        position: fixed;
                        ${config.buttonPosition}
                        padding: 12px 16px;
                        background: ${config.buttonColor};
                        color: white;
                        font-family: Arial;
                        font-size: 14px;
                        font-weight: bold;
                        border-radius: 8px;
                        z-index: 99999;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.5);
                        transition: all 0.3s;
                    }
                    #${buttonId}:hover {
                        transform: scale(1.05);
                        opacity: 0.9;
                    }
                    #${buttonId}:active {
                        transform: scale(0.95);
                    }
                </style>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                ReYohoho
            `;

            // 🔍 Обработчик клика (поиск + запуск плеера)
            button.addEventListener('click', async function() {
                const tmdbData = await getTmdbData();
                
                if (!tmdbData?.title) {
                    Lampa.Noty.show("Не удалось получить данные о контенте", "error");
                    return;
                }

                Lampa.Noty.show(`Поиск: ${tmdbData.title}...`, "info");
                
                try {
                    // Открываем ReYohoho в новой вкладке
                    const searchUrl = `${config.reyohohoUrl}${encodeURIComponent(tmdbData.title + " " + tmdbData.year)}`;
                    window.open(searchUrl, '_blank');
                    
                    // (Опционально) Можно добавить автоматическое получение потока через API, если оно есть
                } catch (e) {
                    console.error("[Lampa-ReYohoho] Ошибка:", e);
                    Lampa.Noty.show("Ошибка при поиске", "error");
                }
            });

            document.body.appendChild(button);
        }

        // 🚀 Инициализация
        function init() {
            createButton();
            
            // Обновляем кнопку при смене контента
            if (Lampa.Listener && Lampa.Listener.follow) {
                Lampa.Listener.follow('content', (e) => {
                    if (e.type === 'item') {
                        setTimeout(createButton, 500);
                    }
                });
            }
        }

        init();
    });
})();
