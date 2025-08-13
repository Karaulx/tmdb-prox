// Lampa-ReYohoho AutoStream Bridge v6.0
(function() {
    // Конфигурация
    const config = {
        reyohohoSearch: "https://reyohoho.github.io/reyohoho/?search=",
        corsProxy: "https://api.allorigins.win/raw?url=", // Прокси для обхода CORS
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#FF5722",
        timeout: 10000
    };

    // Ожидаем загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && document.querySelector('.full-start-new__title')) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(function() {
        console.log("[AutoStream] Инициализация...");

        // Получаем данные о контенте
        function getContentData() {
            return {
                title: document.querySelector('.full-start-new__title')?.textContent.trim() || '',
                year: document.querySelector('.full-start-new__head span')?.textContent || '',
                poster: document.querySelector('.full-start-new__img.full--poster')?.src || ''
            };
        }

        // Создаем кнопку
        function createButton() {
            const btnId = 'reyohoho-autostream-btn';
            document.getElementById(btnId)?.remove();

            const button = document.createElement('div');
            button.id = btnId;
            button.innerHTML = `
                <style>
                    #${btnId} {
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
                    #${btnId} .loader {
                        display: none;
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-radius: 50%;
                        border-top-color: white;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
                <div class="loader"></div>
                <span class="text">ReYohoho Auto</span>
            `;

            button.addEventListener('click', async function() {
                const content = getContentData();
                if (!content.title) {
                    showAlert('Не удалось получить данные о фильме');
                    return;
                }

                showLoading(button);
                
                try {
                    // 1. Ищем контент через ReYohoho
                    const searchUrl = `${config.reyohohoSearch}${encodeURIComponent(content.title + ' ' + content.year)}`;
                    const html = await fetchPage(searchUrl);
                    
                    // 2. Парсим HTML чтобы найти ссылку на плеер
                    const playerUrl = parsePlayerUrl(html);
                    if (!playerUrl) throw new Error('Плеер не найден');
                    
                    // 3. Получаем HTML страницы плеера
                    const playerHtml = await fetchPage(playerUrl);
                    
                    // 4. Извлекаем прямую ссылку на видео
                    const videoUrl = parseVideoUrl(playerHtml);
                    if (!videoUrl) throw new Error('Ссылка на видео не найдена');
                    
                    // 5. Запускаем в Lampa
                    playInLampa(content, videoUrl);
                    
                } catch (error) {
                    console.error("[AutoStream] Ошибка:", error);
                    showAlert(`Автоматический поиск не удался: ${error.message}`);
                } finally {
                    hideLoading(button);
                }
            });

            document.body.appendChild(button);
        }

        // Загрузка страницы через прокси
        async function fetchPage(url) {
            const response = await fetch(`${config.corsProxy}${encodeURIComponent(url)}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                timeout: config.timeout
            });
            return await response.text();
        }

        // Парсинг URL плеера
        function parsePlayerUrl(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return doc.querySelector('a[href*="/watch/"]')?.href;
        }

        // Парсинг URL видео
        function parseVideoUrl(html) {
            const videoMatch = html.match(/src:\s*["'](https?:\/\/[^"']+\.(m3u8|mp4|mkv))["']/i);
            return videoMatch ? videoMatch[1] : null;
        }

        // Воспроизведение в Lampa
        function playInLampa(content, url) {
            Lampa.Player.play({
                title: `${content.title} (${content.year})`,
                files: [{url: url, quality: "Auto"}],
                poster: content.poster
            });
        }

        // Показать уведомление
        function showAlert(message) {
            if (window.Lampa && Lampa.Noty) {
                Lampa.Noty.show(message, 'error');
            } else {
                alert(message);
            }
        }

        // Показать индикатор загрузки
        function showLoading(button) {
            button.querySelector('.loader').style.display = 'block';
            button.querySelector('.text').textContent = 'Поиск...';
            button.style.opacity = '0.8';
            button.style.cursor = 'wait';
        }

        // Скрыть индикатор загрузки
        function hideLoading(button) {
            button.querySelector('.loader').style.display = 'none';
            button.querySelector('.text').textContent = 'ReYohoho Auto';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }

        // Инициализация
        createButton();
    });
})();
