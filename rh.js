// Ultimate Lampa-ReYohoho Bridge (точная версия)
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true
    };

    // Ожидание полной загрузки страницы
    function waitForLoad(callback) {
        if (document.querySelector('.full-start-new__title')) {
            callback();
        } else {
            setTimeout(() => waitForLoad(callback), 100);
        }
    }

    waitForLoad(function() {
        console.log("[Lampa-ReYohoho] Страница загружена");

        // Получение данных из карточки
        function getContentData() {
            try {
                // Основные элементы
                const titleElement = document.querySelector('.full-start-new__title');
                const yearElement = document.querySelector('.full-start-new__head span');
                const posterElement = document.querySelector('.full-start-new__img.full--poster');
                const typeElement = document.querySelector('.card__type');
                
                // Извлекаем данные
                const title = titleElement ? titleElement.textContent.trim() : '';
                const year = yearElement ? parseInt(yearElement.textContent) : new Date().getFullYear();
                const poster = posterElement ? posterElement.src : '';
                const type = typeElement ? (typeElement.textContent === 'TV' ? 'tv' : 'movie') : 'movie';
                
                // Из URL получаем ID
                const idMatch = window.location.href.match(/card=(\d+)/);
                const id = idMatch ? idMatch[1] : '';

                console.log("[Lampa-ReYohoho] Найдены данные:", {id, type, title, year, poster});
                return {id, type, title, year, poster};
            } catch (e) {
                console.error("[Lampa-ReYohoho] Ошибка при получении данных:", e);
                return null;
            }
        }

        // Создание кнопки
        function createButton() {
            const buttonId = 'reyohoho-precise-btn';
            
            // Удаляем старую кнопку если есть
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
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"></path>
                </svg>
                ReYohoho
            `;

            // Обработчик клика
            button.addEventListener('click', function() {
                const contentData = getContentData();
                
                if (!contentData || !contentData.title) {
                    alert("Не удалось получить данные о контенте. Пожалуйста, убедитесь что вы находитесь на странице фильма/сериала.");
                    return;
                }

                const searchQuery = `${contentData.title} ${contentData.year}`;
                const searchUrl = `${config.reyohohoUrl}${encodeURIComponent(searchQuery)}`;
                
                console.log("[Lampa-ReYohoho] Открываем поиск:", searchUrl);
                window.open(searchUrl, '_blank');
            });

            document.body.appendChild(button);
            console.log("[Lampa-ReYohoho] Кнопка создана");
        }

        // Инициализация
        function init() {
            createButton();
            
            // Обновляем кнопку при изменениях на странице
            const observer = new MutationObserver(function() {
                if (!document.getElementById('reyohoho-precise-btn')) {
                    createButton();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Запуск
        init();
    });
})();
