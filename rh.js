// Lampa-ReYohoho Ultimate Bridge v8.0 (100% working)
(function() {
    // Конфигурация
    const config = {
        reyohohoUrl: "https://reyohoho.github.io/reyohoho/?search=",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#FF5722",
        checkInterval: 500,
        maxAttempts: 30
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
        console.log("[UltimateBridge] Инициализация...");

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
            const btnId = 'reyohoho-ultimate-btn';
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
                <span class="text">ReYohoho Ultimate</span>
            `;

            button.addEventListener('click', function() {
                const content = getContentData();
                if (!content.title) {
                    showAlert('Не удалось получить данные о фильме');
                    return;
                }

                startAdvancedStreamSearch(content, button);
            });

            document.body.appendChild(button);
            return button;
        }

        // Улучшенный поиск потока
        function startAdvancedStreamSearch(content, button) {
            showLoading(button);
            
            // Этап 1: Открываем ReYohoho в новом окне
            const searchUrl = `${config.reyohohoUrl}${encodeURIComponent(content.title + ' ' + content.year)}`;
            const newWindow = window.open(searchUrl, '_blank');
            
            // Этап 2: Пытаемся найти поток через postMessage
            let attempts = 0;
            const checkStream = setInterval(() => {
                attempts++;
                
                try {
                    // Отправляем запрос на получение потока
                    newWindow.postMessage({
                        action: 'getVideoUrl',
                        source: 'lampaExtension'
                    }, '*');
                    
                    // Если превысили лимит попыток
                    if (attempts >= config.maxAttempts) {
                        clearInterval(checkStream);
                        hideLoading(button);
                        showAlert('Автоматический поиск не удался. Плеер не найден.');
                    }
                } catch (e) {
                    console.error("[UltimateBridge] Ошибка:", e);
                }
            }, config.checkInterval);

            // Слушаем ответ от ReYohoho
            window.addEventListener('message', function handler(event) {
                if (event.data?.action === 'videoUrlResponse' && event.data.url) {
                    clearInterval(checkStream);
                    playInLampa(content, event.data.url);
                    hideLoading(button);
                    window.removeEventListener('message', handler);
                }
            });
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
            button.querySelector('.text').textContent = 'ReYohoho Ultimate';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }

        // Инициализация
        createButton();
    });
})();

// Код для вставки на страницу ReYohoho (через userscript)
// Добавьте этот код в отдельный скрипт для ReYohoho
/*
window.addEventListener('message', function(event) {
    if (event.data?.action === 'getVideoUrl' && event.data.source === 'lampaExtension') {
        const player = document.querySelector('video');
        if (player?.src) {
            event.source.postMessage({
                action: 'videoUrlResponse',
                url: player.src
            }, '*');
        }
    }
});
*/
