// Lampa-ReYohoho Direct Link v5.0 (без API)
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#FF5722",
        debugMode: true,
        timeout: 8000
    };

    // Ожидание инициализации Lampa
    function waitForLampa(callback) {
        if (window.Lampa && document.querySelector('.full-start-new__title')) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log("[ReYohohoBridge] Инициализация...");

        // Получение данных о контенте
        function getContentData() {
            return {
                title: document.querySelector('.full-start-new__title')?.textContent.trim() || '',
                year: parseInt(document.querySelector('.full-start-new__head span')?.textContent) || '',
                poster: document.querySelector('.full-start-new__img.full--poster')?.src || ''
            };
        }

        // Создание кнопки
        function createButton() {
            const buttonId = 'reyohoho-directlink-btn';
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
                    }
                    #${buttonId}:hover { opacity: 0.9; }
                </style>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                ReYohoho Direct
            `;

            button.addEventListener('click', function() {
                const content = getContentData();
                if (!content.title) {
                    alert("Не удалось получить данные о контенте");
                    return;
                }

                // Создаем iframe для работы с ReYohoho
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = `${config.reyohohoUrl}${encodeURIComponent(content.title + ' ' + content.year)}`;
                document.body.appendChild(iframe);

                // Пытаемся найти плеер в iframe
                const timer = setTimeout(() => {
                    iframe.remove();
                    manualFallback(content);
                }, config.timeout);

                iframe.onload = function() {
                    try {
                        const player = iframe.contentWindow.document.querySelector('video');
                        if (player && player.src) {
                            clearTimeout(timer);
                            playInLampa(content, player.src);
                            iframe.remove();
                        }
                    } catch (e) {
                        console.log("CORS ограничение, используем fallback метод");
                        manualFallback(content);
                    }
                };
            });

            document.body.appendChild(button);
        }

        // Воспроизведение в Lampa
        function playInLampa(content, url) {
            Lampa.Player.play({
                title: `${content.title} (${content.year})`,
                files: [{url: url, quality: "Auto"}],
                poster: content.poster
            });
        }

        // Ручной ввод ссылки
        function manualFallback(content) {
            const videoUrl = prompt(
                `Автоматический поиск не удался.\n\n1. Откройте ReYohoho в новой вкладке\n2. Найдите и запустите "${content.title}"\n3. Скопируйте ссылку на видео (из inspect element)\n4. Вставьте сюда:`,
                "https://"
            );
            
            if (videoUrl && videoUrl.startsWith('http')) {
                playInLampa(content, videoUrl);
            } else {
                window.open(`${config.reyohohoUrl}${encodeURIComponent(content.title + ' ' + content.year)}`, '_blank');
            }
        }

        // Инициализация
        createButton();
        
        // Обновление кнопки при изменениях DOM
        new MutationObserver(() => {
            if (!document.getElementById('reyohoho-directlink-btn')) {
                createButton();
            }
        }).observe(document.body, {childList: true, subtree: true});
    });
})();
