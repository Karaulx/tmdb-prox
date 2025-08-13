// Lampa-ReYohoho Bridge (улучшенная версия с гарантированным получением данных)
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true,
        maxRetries: 5,
        retryDelay: 300
    };

    // Ожидаем загрузки Lampa
    function waitForLampa(callback, attempts = 0) {
        if (window.Lampa && window.Lampa.Storage && window.Lampa.Player) {
            callback();
        } else if (attempts < 30) {
            setTimeout(() => waitForLampa(callback, attempts + 1), 100);
        } else {
            console.error("[Lampa-ReYohoho] Lampa API не загрузилось");
        }
    }

    waitForLampa(function() {
        console.log("[Lampa-ReYohoho] Инициализация");

        // Улучшенный метод получения данных
        function getTmdbData() {
            let item = {};
            try {
                // 1. Пробуем получить данные через Lampa API
                const storageItem = Lampa.Storage.get('current_item') || {};
                
                // 2. Получаем основные данные
                item = {
                    id: storageItem.id,
                    type: storageItem.type || (window.location.pathname.includes('/tv/') ? 'tv' : 'movie'),
                    title: storageItem.title || storageItem.name || '',
                    year: storageItem.year || new Date().getFullYear(),
                    poster: storageItem.poster || storageItem.cover || ''
                };

                // 3. Если название не найдено, ищем в DOM
                if (!item.title) {
                    const titleElement = document.querySelector('.card__title, .full-start__title, .player__title, [data-id="title"]');
                    if (titleElement) {
                        item.title = titleElement.textContent.trim();
                        item.name = item.title;
                    }
                }

                // 4. Если год не найден, ищем в DOM
                if (!item.year || isNaN(item.year)) {
                    const yearElement = document.querySelector('.card__year, .full-start__year, .player__year, [data-id="year"]');
                    if (yearElement) {
                        item.year = parseInt(yearElement.textContent) || new Date().getFullYear();
                    }
                }

                // 5. Если постер не найден, ищем в DOM
                if (!item.poster) {
                    const posterElement = document.querySelector('.card__poster, .full-start__poster, .player__poster img, [data-id="poster"]');
                    if (posterElement) {
                        item.poster = posterElement.src || posterElement.getAttribute('data-src') || '';
                    }
                }

                // 6. Если ID не найден, пробуем из URL
                if (!item.id) {
                    const idMatch = window.location.pathname.match(/\/(movie|tv)\/(\d+)/);
                    if (idMatch) item.id = idMatch[2];
                }

                console.log("[Lampa-ReYohoho] Полученные данные:", item);
                return item;

            } catch (e) {
                console.error("[Lampa-ReYohoho] Ошибка получения данных:", e);
                return null;
            }
        }

        // Метод для повторных попыток получения данных
        async function getTmdbDataWithRetry(retry = 0) {
            const data = getTmdbData();
            
            if ((!data?.title && !data?.name) && retry < config.maxRetries) {
                console.log(`[Lampa-ReYohoho] Повторная попытка получения данных (${retry + 1})`);
                await new Promise(resolve => setTimeout(resolve, config.retryDelay));
                return getTmdbDataWithRetry(retry + 1);
            }
            
            return data;
        }

        // Создаем кнопку
        function createButton() {
            const buttonId = 'reyohoho-bridge-btn';
            document.getElementById(buttonId)?.remove();

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

            button.addEventListener('click', async function() {
                const tmdbData = await getTmdbDataWithRetry();
                
                if (!tmdbData?.title && !tmdbData?.name) {
                    Lampa.Noty.show("Не удалось получить данные о контенте", "error");
                    console.error("[Lampa-ReYohoho] Данные не найдены:", tmdbData);
                    return;
                }

                const searchQuery = `${tmdbData.title || tmdbData.name} ${tmdbData.year}`;
                Lampa.Noty.show(`Поиск: ${searchQuery}...`, "info");
                
                try {
                    window.open(`${config.reyohohoUrl}${encodeURIComponent(searchQuery)}`, '_blank');
                } catch (e) {
                    console.error("[Lampa-ReYohoho] Ошибка открытия ReYohoho:", e);
                    Lampa.Noty.show("Ошибка при открытии поиска", "error");
                }
            });

            document.body.appendChild(button);
        }

        // Инициализация
        function init() {
            createButton();
            
            // Обновляем кнопку при изменениях
            const observer = new MutationObserver(() => {
                if (!document.getElementById('reyohoho-bridge-btn')) {
                    createButton();
                }
            });
            
            observer.observe(document.body, { childList: true, subtree: true });
        }

        init();
    });
})();
