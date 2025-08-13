// Lampa-ReYohoho Auto-Play Bridge
(function() {
    // Конфигурация
    const config = {
        reyohohoSearch: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true,
        timeout: 10000 // 10 секунд на поиск потока
    };

    // Ожидание элементов Lampa
    function waitForLampa(callback) {
        if (window.Lampa && document.querySelector('.full-start-new__title')) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log("[ReYohohoBridge] Инициализация");

        // Получение данных из карточки
        function getContentData() {
            const data = {
                id: window.location.href.match(/card=(\d+)/)?.[1] || '',
                type: document.querySelector('.card__type')?.textContent === 'TV' ? 'tv' : 'movie',
                title: document.querySelector('.full-start-new__title')?.textContent.trim() || '',
                year: parseInt(document.querySelector('.full-start-new__head span')?.textContent) || new Date().getFullYear(),
                poster: document.querySelector('.full-start-new__img.full--poster')?.src || ''
            };
            
            console.log("[ReYohohoBridge] Данные:", data);
            return data;
        }

        // Создание iframe для ReYohoho
        function createHiddenIframe(url) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            return iframe;
        }

        // Поиск потока в iframe
        function findStreamInIframe(iframe, callback) {
            const startTime = Date.now();
            
            const checkInterval = setInterval(() => {
                try {
                    // Попробуем получить поток из iframe
                    const player = iframe.contentWindow.document.querySelector('video');
                    if (player && player.src) {
                        clearInterval(checkInterval);
                        callback(player.src);
                    } 
                    // Если время вышло
                    else if (Date.now() - startTime > config.timeout) {
                        clearInterval(checkInterval);
                        callback(null);
                    }
                } catch (e) {
                    // Игнорируем ошибки кросс-доменных ограничений
                }
            }, 500);
        }

        // Создание кнопки
        function createButton() {
            const buttonId = 'reyohoho-auto-btn';
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
                    #${buttonId}:hover { transform: scale(1.05); opacity: 0.9; }
                    #${buttonId}:active { transform: scale(0.95); }
                </style>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                ReYohoho Auto
            `;

            button.addEventListener('click', async function() {
                const content = getContentData();
                if (!content.title) {
                    Lampa.Noty.show("Не удалось получить данные", "error");
                    return;
                }

                Lampa.Noty.show(`Поиск "${content.title}"...`, "info");
                
                // 1. Открываем ReYohoho в скрытом iframe
                const searchUrl = `${config.reyohohoSearch}${encodeURIComponent(content.title + ' ' + content.year)}`;
                const iframe = createHiddenIframe(searchUrl);
                
                // 2. Ищем поток
                findStreamInIframe(iframe, function(streamUrl) {
                    iframe.remove();
                    
                    if (streamUrl) {
                        Lampa.Noty.show("Поток найден!", "success");
                        
                        // 3. Запускаем в плеере Lampa
                        Lampa.Player.play({
                            title: content.title,
                            files: [{url: streamUrl, quality: "Auto"}],
                            poster: content.poster
                        });
                    } else {
                        Lampa.Noty.show("Не удалось найти поток", "error");
                        window.open(searchUrl, '_blank'); // Открываем вручную
                    }
                });
            });

            document.body.appendChild(button);
        }

        // Инициализация
        createButton();
        
        // Авто-обновление кнопки
        new MutationObserver(() => {
            if (!document.getElementById('reyohoho-auto-btn')) {
                createButton();
            }
        }).observe(document.body, {childList: true, subtree: true});
    });
})();
