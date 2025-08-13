// Ultimate Lampa-ReYohoho Bridge
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true,
        maxRetries: 5,
        retryDelay: 500
    };

    // Ожидаем полной загрузки Lampa
    function waitForLampa(callback, attempts = 0) {
        const isReady = () => {
            return window.Lampa && 
                   window.Lampa.Storage && 
                   window.Lampa.Player &&
                   document.querySelector('body');
        };

        if (isReady()) {
            callback();
        } else if (attempts < 50) {
            setTimeout(() => waitForLampa(callback, attempts + 1), 100);
        } else {
            console.error("[Lampa-ReYohoho] Lampa не загрузилась полностью");
        }
    }

    waitForLampa(function() {
        console.log("[Lampa-ReYohoho] Инициализация");

        // Полный сбор данных со всех возможных источников
        function getContentData() {
            const data = {
                id: '',
                type: '',
                title: '',
                year: '',
                poster: ''
            };

            try {
                // 1. Пробуем получить данные через Lampa API
                const storageItem = Lampa.Storage.get('current_item') || {};
                
                // 2. Получаем ID из разных источников
                data.id = storageItem.id || 
                         window.location.pathname.match(/\/(movie|tv)\/(\d+)/)?.[2] || 
                         '';

                // 3. Определяем тип контента
                data.type = storageItem.type || 
                           (window.location.pathname.includes('/tv/') ? 'tv' : 'movie');

                // 4. Ищем название во всех возможных местах
                const titleSources = [
                    storageItem.title,
                    storageItem.name,
                    document.querySelector('.card__title')?.textContent,
                    document.querySelector('.full-start__title')?.textContent,
                    document.querySelector('.player__title')?.textContent,
                    document.querySelector('.content__title')?.textContent,
                    document.querySelector('[data-id="title"]')?.textContent,
                    document.querySelector('h1')?.textContent
                ];
                data.title = titleSources.find(t => t && t.trim())?.trim() || '';

                // 5. Ищем год
                const yearSources = [
                    storageItem.year,
                    parseInt(document.querySelector('.card__year')?.textContent),
                    parseInt(document.querySelector('.full-start__year')?.textContent),
                    parseInt(document.querySelector('.player__year')?.textContent),
                    parseInt(document.querySelector('[data-id="year"]')?.textContent),
                    new Date().getFullYear()
                ];
                data.year = yearSources.find(y => y && !isNaN(y)) || new Date().getFullYear();

                // 6. Ищем постер
                const posterElements = [
                    document.querySelector('.card__poster'),
                    document.querySelector('.full-start__poster'),
                    document.querySelector('.player__poster img'),
                    document.querySelector('[data-id="poster"] img'),
                    document.querySelector('.poster img')
                ];
                for (const el of posterElements) {
                    if (el) {
                        data.poster = el.src || el.getAttribute('data-src') || '';
                        if (data.poster) break;
                    }
                }

                console.log("[Lampa-ReYohoho] Полученные данные:", data);
                return data;

            } catch (e) {
                console.error("[Lampa-ReYohoho] Ошибка при получении данных:", e);
                return null;
            }
        }

        // Создаем кнопку с проверкой всех условий
        function createButton() {
            const buttonId = 'reyohoho-bridge-btn';
            
            // Удаляем старую кнопку если есть
            const oldButton = document.getElementById(buttonId);
            if (oldButton) {
                try {
                    oldButton.remove();
                } catch (e) {
                    console.error("[Lampa-ReYohoho] Ошибка при удалении кнопки:", e);
                }
            }

            // Проверяем, есть ли необходимые данные
            const data = getContentData();
            if (!data?.title) {
                console.log("[Lampa-ReYohoho] Недостаточно данных для создания кнопки");
                return;
            }

            // Создаем кнопку
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

            // Добавляем обработчик
            button.addEventListener('click', function() {
                const contentData = getContentData();
                if (!contentData?.title) {
                    Lampa.Noty.show("Не удалось получить данные о контенте", "error");
                    return;
                }

                const searchQuery = `${contentData.title} ${contentData.year}`;
                Lampa.Noty.show(`Поиск: ${searchQuery}...`, "info");
                window.open(`${config.reyohohoUrl}${encodeURIComponent(searchQuery)}`, '_blank');
            });

            // Добавляем кнопку в DOM
            document.body.appendChild(button);
            console.log("[Lampa-ReYohoho] Кнопка создана");
        }

        // Инициализация с несколькими стратегиями
        function init() {
            // Стратегия 1: Создать кнопку сразу
            createButton();

            // Стратегия 2: Отслеживать изменения через MutationObserver
            const observer = new MutationObserver(function(mutations) {
                if (!document.getElementById('reyohoho-bridge-btn')) {
                    createButton();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Стратегия 3: Периодическая проверка
            const intervalId = setInterval(() => {
                if (!document.getElementById('reyohoho-bridge-btn')) {
                    createButton();
                }
            }, 3000);

            // Очистка при разгрузке страницы
            window.addEventListener('beforeunload', () => {
                clearInterval(intervalId);
                observer.disconnect();
            });
        }

        // Запускаем
        init();
    });
})();
