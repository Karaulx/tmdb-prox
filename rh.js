// Lampa-ReYohoho Ultimate Bridge v2.0
(function() {
    // Конфигурация
    const config = {
        reyohohoSearch: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#4CAF50",
        debugMode: true,
        timeout: 8000,
        corsProxy: "https://cors-anywhere.herokuapp.com/" // Прокси для обхода CORS
    };

    // Ожидание загрузки Lampa
    function waitForLampa(callback, attempts = 0) {
        if (window.Lampa && document.querySelector('.full-start-new__title')) {
            callback();
        } else if (attempts < 50) { // Максимум 5 секунд ожидания
            setTimeout(() => waitForLampa(callback, attempts + 1), 100);
        }
    }

    // Основная функция
    function init() {
        console.log("[ReYohohoBridge] Инициализация...");

        // Получение данных о контенте
        function getContentData() {
            try {
                const data = {
                    id: window.location.href.match(/card=(\d+)/)?.[1] || '',
                    type: document.querySelector('.card__type')?.textContent?.toLowerCase().includes('tv') ? 'tv' : 'movie',
                    title: document.querySelector('.full-start-new__title')?.textContent.trim() || '',
                    year: parseInt(document.querySelector('.full-start-new__head span')?.textContent) || new Date().getFullYear(),
                    poster: document.querySelector('.full-start-new__img.full--poster')?.src || '',
                    translation: document.querySelector('.selector__item.active')?.textContent.trim() || ''
                };
                
                if (config.debugMode) console.log("[ReYohohoBridge] Данные контента:", data);
                return data;
            } catch (e) {
                console.error("[ReYohohoBridge] Ошибка получения данных:", e);
                return null;
            }
        }

        // Создание кнопки
        function createButton() {
            const buttonId = 'reyohoho-ultimate-btn';
            const existingBtn = document.getElementById(buttonId);
            if (existingBtn) return existingBtn;

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
                    #${buttonId}:hover { transform: scale(1.05); }
                    #${buttonId}:active { transform: scale(0.95); }
                    #${buttonId} .spinner {
                        display: none;
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-radius: 50%;
                        border-top-color: white;
                        animation: spin 1s ease-in-out infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
                <span class="spinner"></span>
                <span class="text">ReYohoho</span>
            `;

            button.addEventListener('click', async function() {
                const content = getContentData();
                if (!content || !content.title) {
                    showAlert("Ошибка: Не удалось получить данные о контенте");
                    return;
                }

                const searchQuery = `${content.title} ${content.year} ${content.translation}`.trim();
                const searchUrl = `${config.reyohohoSearch}${encodeURIComponent(searchQuery)}`;
                
                startLoading(button);
                
                try {
                    // Попробуем автоматический метод
                    const streamUrl = await findStreamAutomatically(searchUrl);
                    
                    if (streamUrl) {
                        playInLampa(content, streamUrl);
                    } else {
                        // Если автоматический метод не сработал - предлагаем ручной ввод
                        offerManualInput(content, searchUrl);
                    }
                } catch (e) {
                    console.error("[ReYohohoBridge] Ошибка:", e);
                    showAlert("Ошибка при поиске потока");
                    window.open(searchUrl, '_blank');
                } finally {
                    stopLoading(button);
                }
            });

            document.body.appendChild(button);
            return button;
        }

        // Показать уведомление
        function showAlert(message, type = "error") {
            if (window.Lampa && Lampa.Noty) {
                Lampa.Noty.show(message, type);
            } else {
                alert(message);
            }
        }

        // Запуск в Lampa
        function playInLampa(content, streamUrl) {
            if (!window.Lampa || !Lampa.Player) {
                showAlert("Ошибка: Плеер Lampa не найден");
                return;
            }

            Lampa.Player.play({
                title: `${content.title} (${content.year})`,
                files: [{url: streamUrl, quality: "Auto"}],
                poster: content.poster,
                type: content.type
            });
        }

        // Автоматический поиск потока
        async function findStreamAutomatically(searchUrl) {
            return new Promise((resolve) => {
                // Создаем скрытый iframe
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = searchUrl;
                document.body.appendChild(iframe);

                // Проверяем наличие плеера
                const checkInterval = setInterval(() => {
                    try {
                        const player = iframe.contentWindow?.document?.querySelector('video');
                        if (player?.src) {
                            clearInterval(checkInterval);
                            iframe.remove();
                            resolve(player.src);
                        }
                    } catch (e) {
                        // Игнорируем CORS ошибки
                    }
                }, 500);

                // Таймаут
                setTimeout(() => {
                    clearInterval(checkInterval);
                    iframe.remove();
                    resolve(null);
                }, config.timeout);
            });
        }

        // Ручной ввод URL
        function offerManualInput(content, searchUrl) {
            showAlert("Автоматический поиск не удался. Откройте ReYohoho и скопируйте URL видео.", "info");
            
            window.open(searchUrl, '_blank');
            
            setTimeout(() => {
                const streamUrl = prompt("Вставьте URL видео потока из ReYohoho:", "");
                if (streamUrl) {
                    playInLampa(content, streamUrl);
                }
            }, 1000);
        }

        // Индикатор загрузки
        function startLoading(button) {
            button.querySelector('.text').textContent = "Поиск...";
            button.querySelector('.spinner').style.display = 'block';
            button.style.opacity = '0.8';
            button.style.cursor = 'wait';
        }

        function stopLoading(button) {
            button.querySelector('.text').textContent = "ReYohoho";
            button.querySelector('.spinner').style.display = 'none';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }

        // Инициализация кнопки
        const button = createButton();

        // Обновление при изменениях DOM
        new MutationObserver(() => {
            if (!document.getElementById('reyohoho-ultimate-btn')) {
                createButton();
            }
        }).observe(document.body, {childList: true, subtree: true});
    }

    // Запуск
    waitForLampa(init);
})();
