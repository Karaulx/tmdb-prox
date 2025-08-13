// Universal Local Bridge для Lampa
(function() {
    // Конфигурация
    const config = {
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true,
        torrentSearchEngines: [
            "https://yohoho.cc/search.php?q=",
            "https://rutracker.org/forum/tracker.php?nm="
        ]
    };

    // Ожидание готовности Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage && window.Lampa.Player) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log("[LocalBridge] Инициализация");

        // Получение данных контента
        function getContentData() {
            try {
                const item = Lampa.Storage.get('current_item') || {};
                const backupTitle = document.querySelector('.card__title, .full-start__title')?.textContent.trim();
                
                return {
                    id: item.id,
                    type: item.type || (window.location.pathname.includes('/tv/') ? 'tv' : 'movie'),
                    title: item.title || item.name || backupTitle || 'Unknown',
                    year: item.year || new Date().getFullYear(),
                    poster: item.poster || item.cover || ''
                };
            } catch (e) {
                console.error("[LocalBridge] Ошибка получения данных:", e);
                return {title: 'Unknown', type: 'movie', year: new Date().getFullYear()};
            }
        }

        // Создание универсальной кнопки
        function createUniversalButton() {
            const buttonId = 'local-universal-btn';
            
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
                    #${buttonId}-menu {
                        position: absolute;
                        bottom: 50px;
                        right: 0;
                        background: #2c2c2c;
                        border-radius: 8px;
                        padding: 10px;
                        display: none;
                        flex-direction: column;
                        gap: 5px;
                        min-width: 200px;
                    }
                    #${buttonId}-menu a {
                        color: white;
                        padding: 8px;
                        border-radius: 4px;
                        text-decoration: none;
                    }
                    #${buttonId}-menu a:hover {
                        background: ${config.buttonColor};
                    }
                </style>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                Torrent Search
                <div id="${buttonId}-menu">
                    ${config.torrentSearchEngines.map((url, i) => 
                        `<a href="#" data-url="${url}" target="_blank">Поиск в ${new URL(url).hostname}</a>`
                    ).join('')}
                </div>
            `;

            // Обработчики событий
            button.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') return;
                
                const menu = document.getElementById(`${buttonId}-menu`);
                menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
            });

            // Обработчик выбора поисковика
            document.getElementById(`${buttonId}-menu`).addEventListener('click', function(e) {
                if (e.target.tagName === 'A') {
                    e.preventDefault();
                    const content = getContentData();
                    const searchUrl = e.target.dataset.url + encodeURIComponent(`${content.title} ${content.year}`);
                    window.open(searchUrl, '_blank');
                }
            });

            document.body.appendChild(button);
            console.log("[LocalBridge] Универсальная кнопка создана");
        }

        // Инициализация с отслеживанием изменений
        function init() {
            createUniversalButton();
            
            // Отслеживаем изменения контента
            Lampa.Listener.follow('content', (e) => {
                if (e.type === 'item') {
                    setTimeout(createUniversalButton, 300);
                }
            });
            
            // Дополнительная проверка
            setInterval(() => {
                if (!document.getElementById('local-universal-btn')) {
                    createUniversalButton();
                }
            }, 5000);
        }

        // Запуск
        init();
    });
})();
