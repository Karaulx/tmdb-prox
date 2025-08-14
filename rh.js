// ==UserScript==
// @name         Lampa-ReYohoho Ultimate Bridge v8.1
// @namespace    http://tampermonkey.net/
// @version      8.1
// @description  Прямая интеграция ReYohoho с Lampa
// @author       YourName
// @match        http*://*lampa*
// @icon         https://reyohoho.github.io/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      your-server.com
// ==/UserScript==

(function() {
    // Конфигурация
    const config = {
        apiEndpoint: "https://your-server.com/lampa_bridge.php",
        apiKey: "SECRET_KEY_12345",
        buttonPosition: "bottom: 20px; right: 20px;",
        buttonColor: "#FF5722",
        timeout: 15000,
        retryCount: 3
    };

    // Ожидаем загрузки Lampa
    const init = () => {
        if (window.Lampa && document.querySelector('.full-start-new__title')) {
            setupPlugin();
        } else {
            setTimeout(init, 500);
        }
    };

    // Основная инициализация
    const setupPlugin = () => {
        console.log("[ReYohoho Bridge] Инициализация...");

        const button = createButton();
        let currentRequest = null;

        button.addEventListener('click', async () => {
            if (button.classList.contains('loading')) return;

            const content = getContentData();
            if (!content.title) {
                showAlert('Не удалось определить фильм');
                return;
            }

            try {
                await startStreamSearch(content, button);
            } catch (e) {
                console.error("[Bridge] Error:", e);
                showAlert('Ошибка при поиске: ' + e.message);
            }
        });
    };

    // Получение данных о контенте
    const getContentData = () => ({
        title: document.querySelector('.full-start-new__title')?.textContent.trim() || '',
        year: document.querySelector('.full-start-new__head span')?.textContent.match(/\d{4}/)?.[0] || '',
        poster: document.querySelector('.full-start-new__img.full--poster')?.src || '',
        translation: document.querySelector('.selector__item.active')?.textContent.trim() || ''
    });

    // Создание кнопки
    const createButton = () => {
        const existingBtn = document.getElementById('reyohoho-ultimate-btn');
        if (existingBtn) return existingBtn;

        const button = document.createElement('div');
        button.id = 'reyohoho-ultimate-btn';
        button.className = 'reyohoho-button';
        button.innerHTML = `
            <div class="loader"></div>
            <span class="text">ReYohoho</span>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .reyohoho-button {
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
                transition: opacity 0.3s;
            }
            .reyohoho-button.loading {
                opacity: 0.7;
                cursor: wait;
            }
            .reyohoho-button .loader {
                display: none;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;

        document.head.appendChild(style);
        document.body.appendChild(button);
        return button;
    };

    // Поиск потока
    const startStreamSearch = async (content, button) => {
        button.classList.add('loading');
        button.querySelector('.loader').style.display = 'block';
        button.querySelector('.text').textContent = 'Поиск...';

        try {
            const streamData = await fetchStreamUrl(content);
            if (streamData.url) {
                playInLampa(content, streamData.url);
            } else {
                showAlert('Поток не найден');
            }
        } finally {
            button.classList.remove('loading');
            button.querySelector('.loader').style.display = 'none';
            button.querySelector('.text').textContent = 'ReYohoho';
        }
    };

    // Запрос к API
    const fetchStreamUrl = (content) => {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `${config.apiEndpoint}?key=${config.apiKey}&title=${encodeURIComponent(content.title)}&year=${content.year}`,
                timeout: config.timeout,
                onload: (response) => {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.status === "success") {
                            resolve(data.data);
                        } else {
                            reject(new Error(data.message || "Invalid response"));
                        }
                    } catch (e) {
                        reject(new Error("Parse error"));
                    }
                },
                onerror: () => reject(new Error("Network error")),
                ontimeout: () => reject(new Error("Timeout"))
            });
        });
    };

    // Воспроизведение в Lampa
    const playInLampa = (content, url) => {
        Lampa.Player.play({
            title: `${content.title} (${content.year})`,
            files: [{url: url, quality: "Auto"}],
            poster: content.poster,
            translation: content.translation
        });
    };

    // Показать уведомление
    const showAlert = (message) => {
        if (window.Lampa?.Noty) {
            Lampa.Noty.show(message, 'error');
        } else {
            alert(message);
        }
    };

    // Запуск
    init();
})();
