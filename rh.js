// ReYohoho-TMDB Bridge Plugin для Lampa
(function() {
    // 1. Конфигурация
    const config = {
        reyohohoSearchUrl: "https://reyohoho.github.io/api/search?query=",
        reyohohoPlayerUrl: "https://reyohoho.github.io/api/player?url=",
        buttonColor: "#00ff00",
        debugMode: true
    };

    // 2. Ожидание загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Player) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 200);
        }
    }

    waitForLampa(function() {
        console.log("[ReyohohoBridge] Lampa loaded, initializing plugin");

        // 3. Получение данных контента
        function getContentData() {
            const item = Lampa.Storage.get('current_item') || {};
            return {
                title: item.title || item.name,
                year: item.year,
                type: item.type,
                tmdb_id: item.id
            };
        }

        // 4. Поиск на ReYohoho
        function searchOnReYohoho(content, callback) {
            const searchUrl = `${config.reyohohoSearchUrl}${encodeURIComponent(content.title)}&year=${content.year}`;
            
            if (config.debugMode) console.log("[ReyohohoBridge] Searching:", searchUrl);
            
            fetch(searchUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        callback(data.results[0].url);
                    } else {
                        Lampa.Noty.show("Контент не найден на ReYohoho", "error");
                    }
                })
                .catch(e => {
                    console.error("[ReyohohoBridge] Search error:", e);
                    Lampa.Noty.show("Ошибка поиска", "error");
                });
        }

        // 5. Получение потока из плеера ReYohoho
        function getStreamFromReYohoho(url, callback) {
            const playerUrl = `${config.reyohohoPlayerUrl}${encodeURIComponent(url)}`;
            
            if (config.debugMode) console.log("[ReyohohoBridge] Getting stream:", playerUrl);
            
            fetch(playerUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.stream) {
                        callback(data.stream);
                    } else {
                        Lampa.Noty.show("Не удалось получить поток", "error");
                    }
                })
                .catch(e => {
                    console.error("[ReyohohoBridge] Player error:", e);
                    Lampa.Noty.show("Ошибка получения потока", "error");
                });
        }

        // 6. Создание кнопки
        function createButton() {
            const button = $(`
                <div class="reyohoho-bridge-button" 
                     style="position: fixed;
                            bottom: 20px;
                            right: 20px;
                            padding: 12px 16px;
                            background: ${config.buttonColor};
                            color: #000;
                            font-weight: bold;
                            border-radius: 8px;
                            z-index: 99999;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                    </svg>
                    ReYohoho Bridge
                </div>
            `);

            button.on('click', function() {
                const content = getContentData();
                if (!content.title) {
                    Lampa.Noty.show("Не удалось получить данные контента", "error");
                    return;
                }

                Lampa.Noty.show("Поиск на ReYohoho...", "info");
                
                searchOnReYohoho(content, function(reYohohoUrl) {
                    Lampa.Noty.show("Получение потока...", "info");
                    
                    getStreamFromReYohoho(reYohohoUrl, function(streamUrl) {
                        Lampa.Player.play({
                            title: content.title,
                            files: [{ url: streamUrl }],
                            poster: Lampa.Storage.get('current_item').poster
                        });
                    });
                });
            });

            $('body').append(button);
            console.log("[ReyohohoBridge] Button created");
        }

        // 7. Инициализация
        function init() {
            createButton();
            
            // Дополнительная попытка через 2 секунды
            setTimeout(() => {
                if ($('.reyohoho-bridge-button').length === 0) {
                    createButton();
                }
            }, 2000);
        }

        // Запуск
        init();
    });
})();
