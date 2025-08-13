// ReYohoho Direct Player Integration для Lampa
(function() {
    // 1. Конфигурация (подставьте свои значения)
    const config = {
        // Основной URL плеера (замените на ваш конкретный)
        reyohohoPlayerUrl: "https://reyohoho.github.io/reyohoho/movie/675488",
        
        // URL для получения потока (если API доступен)
        streamApiUrl: "https://reyohoho.github.io/api/stream?id=675488",
        
        // Настройки кнопки
        buttonColor: "#FF5722",
        buttonText: "Смотреть через ReYohoho",
        position: "bottom: 20px; right: 20px;",
        
        // Настройки плеера
        defaultQuality: "1080p",
        forceDirectPlay: true
    };

    // 2. Ожидаем загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Player) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log("[ReYohohoDirect] Инициализация плагина");

        // 3. Получаем данные контента (если нужны)
        function getContentInfo() {
            try {
                return {
                    title: document.querySelector('.card__title')?.textContent || 'ReYohoho',
                    poster: document.querySelector('.card__poster img')?.src || ''
                };
            } catch (e) {
                return {title: 'ReYohoho', poster: ''};
            }
        }

        // 4. Получаем поток (реализация через API или iframe)
        function getStream() {
            return new Promise((resolve) => {
                // Вариант 1: Если есть прямой API
                if (config.streamApiUrl) {
                    fetch(config.streamApiUrl)
                        .then(r => r.json())
                        .then(data => resolve(data.stream))
                        .catch(() => fallbackToIframe(resolve));
                } else {
                    // Вариант 2: Через iframe
                    fallbackToIframe(resolve);
                }
            });
        }

        // 5. Fallback: извлекаем поток через iframe
        function fallbackToIframe(callback) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = config.reyohohoPlayerUrl;
            
            iframe.onload = function() {
                setTimeout(() => {
                    try {
                        // Пытаемся получить поток из iframe (зависит от структуры плеера)
                        const video = iframe.contentDocument.querySelector('video');
                        if (video && video.src) {
                            callback(video.src);
                        } else {
                            callback(config.reyohohoPlayerUrl);
                        }
                    } catch (e) {
                        callback(config.reyohohoPlayerUrl);
                    }
                    document.body.removeChild(iframe);
                }, 2000);
            };
            
            document.body.appendChild(iframe);
        }

        // 6. Создаем кнопку
        function createButton() {
            const btnId = 'reyohoho-direct-btn';
            
            // Удаляем старую кнопку если есть
            document.getElementById(btnId)?.remove();

            const button = document.createElement('div');
            button.id = btnId;
            button.innerHTML = `
                <style>
                    #${btnId} {
                        position: fixed;
                        ${config.position}
                        padding: 12px 16px;
                        background: ${config.buttonColor};
                        color: white;
                        font-family: Arial;
                        font-weight: bold;
                        border-radius: 8px;
                        z-index: 99999;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.7);
                        transition: transform 0.2s;
                    }
                    #${btnId}:hover {
                        transform: scale(1.05);
                    }
                    #${btnId}:active {
                        transform: scale(0.95);
                    }
                </style>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                ${config.buttonText}
            `;

            // Обработчик клика
            button.addEventListener('click', async function() {
                const content = getContentInfo();
                Lampa.Noty.show("Подготовка плеера...");
                
                try {
                    const streamUrl = await getStream();
                    
                    Lampa.Player.play({
                        title: content.title,
                        files: [{
                            url: streamUrl,
                            quality: config.defaultQuality,
                            direct: config.forceDirectPlay
                        }],
                        poster: content.poster
                    });
                } catch (e) {
                    console.error("[ReYohohoDirect] Ошибка:", e);
                    Lampa.Noty.show("Ошибка загрузки", "error");
                    // Fallback: открываем в новом окне
                    window.open(config.reyohohoPlayerUrl, '_blank');
                }
            });

            document.body.appendChild(button);
            console.log("[ReYohohoDirect] Кнопка создана");
        }

        // 7. Инициализация
        function init() {
            createButton();
            
            // Для динамических страниц
            const observer = new MutationObserver(() => {
                if (!document.getElementById('reyohoho-direct-btn')) {
                    createButton();
                }
            });
            
            observer.observe(document.body, {childList: true, subtree: true});
        }

        // Запуск
        init();
    });
})();
