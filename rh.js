// Universal ReYohoho Bridge для Lampa (исправленная версия с сохранением оригинальных путей)
(function() {
    // 1. Конфигурация (без изменений)
    const config = {
        reyohohoSearchAPI: "https://reyohoho.github.io/api/search?query=",
        reyohohoStreamAPI: "https://reyohoho.github.io/api/stream?id=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true
    };

    // 2. Ожидание готовности Lampa (без изменений)
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage && window.Lampa.Player) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log("[ReYohohoBridge] Инициализация");

        // 3. Получение данных контента (без изменений)
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
                console.error("[ReYohohoBridge] Ошибка получения данных:", e);
                return {title: 'Unknown', type: 'movie', year: new Date().getFullYear()};
            }
        }

        // 4. Поиск контента на ReYohoho (без изменений)
        function searchContent(content) {
            return new Promise((resolve) => {
                const searchUrl = `${config.reyohohoSearchAPI}${encodeURIComponent(content.title)}&year=${content.year}&type=${content.type}`;
                
                if (config.debugMode) console.log("[ReYohohoBridge] Поиск контента:", searchUrl);
                
                fetch(searchUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results?.length > 0) {
                            resolve(data.results[0].id);
                        } else {
                            Lampa.Noty.show("Контент не найден на ReYohoho", "warning");
                            resolve(null);
                        }
                    })
                    .catch(e => {
                        console.error("[ReYohohoBridge] Ошибка поиска:", e);
                        resolve(null);
                    });
            });
        }

        // 5. Получение потока (без изменений)
        function getContentStream(reYohohoId) {
            return new Promise((resolve) => {
                const streamUrl = `${config.reyohohoStreamAPI}${reYohohoId}`;
                
                if (config.debugMode) console.log("[ReYohohoBridge] Получение потока:", streamUrl);
                
                fetch(streamUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.stream) {
                            resolve(data.stream);
                        } else {
                            Lampa.Noty.show("Не удалось получить поток", "error");
                            resolve(null);
                        }
                    })
                    .catch(e => {
                        console.error("[ReYohohoBridge] Ошибка получения потока:", e);
                        resolve(null);
                    });
            });
        }

        // 6. Создание универсальной кнопки (исправлена только ошибка с addEventListener)
        function createUniversalButton() {
            const buttonId = 'reyohoho-universal-btn';
            
            // Удаляем старую кнопку если есть (без изменений)
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

            // Добавляем кнопку в DOM перед добавлением обработчика
            document.body.appendChild(button);

            // Обработчик клика с проверкой существования кнопки
            if (button) {
                button.addEventListener('click', async function() {
                    const content = getContentData();
                    Lampa.Noty.show(`Поиск: ${content.title}...`, "info");
                    
                    const reYohohoId = await searchContent(content);
                    if (!reYohohoId) return;
                    
                    Lampa.Noty.show("Получение потока...", "info");
                    const streamUrl = await getContentStream(reYohohoId);
                    if (!streamUrl) return;
                    
                    // Запуск в плеере Lampa (без изменений)
                    Lampa.Player.play({
                        title: content.title,
                        files: [{url: streamUrl, quality: "Auto"}],
                        poster: content.poster
                    });
                });
            } else {
                console.error("[ReYohohoBridge] Не удалось создать кнопку");
            }

            console.log("[ReYohohoBridge] Универсальная кнопка создана");
        }

        // 7. Инициализация с отслеживанием изменений (без изменений)
        function init() {
            createUniversalButton();
            
            // Отслеживаем изменения контента
            Lampa.Listener.follow('content', (e) => {
                if (e.type === 'item') {
                    setTimeout(createUniversalButton, 300);
                }
            });
            
            // Дополнительная проверка каждые 5 секунд
            setInterval(() => {
                if (!document.getElementById('reyohoho-universal-btn')) {
                    createUniversalButton();
                }
            }, 5000);
        }

        // Запуск (без изменений)
        init();
    });
})();
