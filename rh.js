// Lampa-ReYohoho Smart Bridge v7.0 (Client-side only)
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#FF5722",
        checkInterval: 500,
        maxAttempts: 20
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
        console.log("[SmartBridge] Инициализация...");

        // Получаем данные о контенте
        function getContentData() {
            return {
                title: document.querySelector('.full-start-new__title')?.textContent.trim() || '',
                year: document.querySelector('.full-start-new__head span')?.textContent || '',
                poster: document.querySelector('.full-start-new__img.full--poster')?.src || '',
                translation: document.querySelector('.selector__item.active')?.textContent.trim() || ''
            };
        }

        // Создаем кнопку
        function createButton() {
            const btnId = 'reyohoho-smart-btn';
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
                <span class="text">ReYohoho Smart</span>
            `;

            button.addEventListener('click', function() {
                const content = getContentData();
                if (!content.title) {
                    showAlert('Не удалось получить данные о фильме');
                    return;
                }

                startStreamSearch(content, button);
            });

            document.body.appendChild(button);
            return button;
        }

        // Запуск поиска потока
        function startStreamSearch(content, button) {
            showLoading(button);
            
            // Создаем скрытый iframe
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `${config.reyohohoUrl}${encodeURIComponent(content.title + ' ' + content.year)}`;
            document.body.appendChild(iframe);

            let attempts = 0;
            const checkStream = setInterval(() => {
                attempts++;
                try {
                    // Пытаемся найти видео в iframe
                    const player = iframe.contentDocument?.querySelector('video');
                    if (player?.src) {
                        clearInterval(checkStream);
                        iframe.remove();
                        playInLampa(content, player.src);
                        hideLoading(button);
                    }
                } catch (e) {
                    // Игнорируем CORS ошибки
                }

                if (attempts >= config.maxAttempts) {
                    clearInterval(checkStream);
                    iframe.remove();
                    hideLoading(button);
                    showAlert('Автоматический поиск не удался. Попробуйте вручную через DevTools.');
                }
            }, config.checkInterval);
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
            button.querySelector('.text').textContent = 'ReYohoho Smart';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }

        // Инициализация
        createButton();
    });
})();
