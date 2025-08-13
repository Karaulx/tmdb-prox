// Lampa-ReYohoho Bridge
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true
    };

    // Ожидаем загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage && window.Lampa.Player) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log("[Lampa-ReYohoho] Инициализация");

        // Получаем данные из TMDB карточки
        function getTmdbData() {
            try {
                const item = Lampa.Storage.get('current_item') || {};
                const backupTitle = document.querySelector('.card__title, .full-start__title')?.textContent.trim();
                
                return {
                    id: item.id,
                    type: item.type || (window.location.pathname.includes('/tv/') ? 'tv' : 'movie'),
                    title: item.title || item.name || backupTitle || '',
                    year: item.year || new Date().getFullYear(),
                    poster: item.poster || item.cover || ''
                };
            } catch (e) {
                console.error("[Lampa-ReYohoho] Ошибка получения данных:", e);
                return null;
            }
        }

        // Создаем кнопку в интерфейсе
        function createButton() {
            const buttonId = 'reyohoho-bridge-btn';
            
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
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                ReYohoho
            `;

            // Добавляем обработчик клика
            button.addEventListener('click', async function() {
                const tmdbData = getTmdbData();
                if (!tmdbData || !tmdbData.title) {
                    Lampa.Noty.show("Не удалось получить данные о контенте", "error");
                    return;
                }

                Lampa.Noty.show(`Поиск: ${tmdbData.title}...`, "info");
                
                try {
                    // Открываем ReYohoho в скрытом iframe
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = `${config.reyohohoUrl}?search=${encodeURIComponent(tmdbData.title)}`;
                    document.body.appendChild(iframe);

                    // Ждем загрузки iframe
                    await new Promise(resolve => iframe.onload = resolve);
                    
                    // Получаем поток из ReYohoho
                    const streamUrl = await iframe.contentWindow.postMessage({
                        action: 'getStream',
                        title: tmdbData.title,
                        year: tmdbData.year,
                        type: tmdbData.type
                    }, config.reyohohoUrl);

                    if (streamUrl) {
                        Lampa.Player.play({
                            title: tmdbData.title,
                            files: [{url: streamUrl, quality: "Auto"}],
                            poster: tmdbData.poster
                        });
                    } else {
                        Lampa.Noty.show("Не удалось получить поток", "error");
                    }
                    
                    document.body.removeChild(iframe);
                } catch (e) {
                    console.error("[Lampa-ReYohoho] Ошибка:", e);
                    Lampa.Noty.show("Ошибка при получении потока", "error");
                }
            });

            document.body.appendChild(button);
        }

        // Инициализация
        function init() {
            createButton();
            
            // Обновляем кнопку при смене контента
            Lampa.Listener.follow('content', (e) => {
                if (e.type === 'item') {
                    setTimeout(createButton, 300);
                }
            });
        }

        init();
    });

    // Обработчик сообщений от ReYohoho
    window.addEventListener('message', (event) => {
        if (event.origin !== config.reyohohoUrl) return;
        
        if (event.data.action === 'streamReady') {
            const streamUrl = event.data.url;
            // Здесь можно передать streamUrl в Lampa Player
        }
    });
})();
