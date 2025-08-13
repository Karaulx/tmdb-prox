// Lampa-ReYohoho Direct Stream Bridge v4.0
(function() {
    // Конфигурация
    const config = {
        reyohohoApi: "https://api4.rhhhhhhh.live",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#FF5722",
        debugMode: true,
        timeout: 15000
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
                id: window.location.href.match(/card=(\d+)/)?.[1] || '',
                type: document.querySelector('.card__type')?.textContent === 'TV' ? 'tv' : 'movie',
                title: document.querySelector('.full-start-new__title')?.textContent.trim() || '',
                year: parseInt(document.querySelector('.full-start-new__head span')?.textContent) || new Date().getFullYear(),
                poster: document.querySelector('.full-start-new__img.full--poster')?.src || ''
            };
        }

        // Создание кнопки
        function createButton() {
            const buttonId = 'reyohoho-direct-btn';
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
                ReYohoho Stream
            `;

            button.addEventListener('click', async function() {
                const content = getContentData();
                if (!content.title) {
                    alert("Не удалось получить данные о контенте");
                    return;
                }

                // 1. Поиск контента через API ReYohoho
                const searchUrl = `${config.reyohohoApi}/search?query=${encodeURIComponent(content.title + ' ' + content.year)}`;
                
                try {
                    const response = await fetch(searchUrl);
                    const data = await response.json();
                    
                    if (!data.results || data.results.length === 0) {
                        throw new Error("Контент не найден");
                    }

                    // 2. Получение ID первого результата
                    const contentId = data.results[0].id;
                    
                    // 3. Запрос информации о потоке
                    const streamInfoUrl = `${config.reyohohoApi}/stream?id=${contentId}&type=${content.type}`;
                    const streamResponse = await fetch(streamInfoUrl);
                    const streamData = await streamResponse.json();
                    
                    if (!streamData.url) {
                        throw new Error("Поток не найден");
                    }

                    // 4. Воспроизведение в Lampa
                    Lampa.Player.play({
                        title: `${content.title} (${content.year})`,
                        files: [{url: streamData.url, quality: "Auto"}],
                        poster: content.poster
                    });

                } catch (e) {
                    console.error("[ReYohohoBridge] Ошибка:", e);
                    alert(`Ошибка: ${e.message}\n\nОткрываю ReYohoho для ручного выбора...`);
                    window.open(`https://reyohoho.github.io/reyohoho/?search=${encodeURIComponent(content.title + ' ' + content.year)}`, '_blank');
                }
            });

            document.body.appendChild(button);
        }

        // Инициализация
        createButton();
        
        // Обновление кнопки при изменениях DOM
        new MutationObserver(() => {
            if (!document.getElementById('reyohoho-direct-btn')) {
                createButton();
            }
        }).observe(document.body, {childList: true, subtree: true});
    });
})();
