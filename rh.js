(function(){
    // Защита от дублирования
    if(window.__rh_ultimate_fix) return;
    window.__rh_ultimate_fix = true;

    console.log('[RH ULTIMATE FIX] Initializing');

    // Конфигурация плагина
    const plugin = {
        id: "rh_ultimate_source",
        name: "RH Видео",
        type: "universal",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
        priority: 100,
        style: `
            .rh-source-btn {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                margin: 5px;
                background: rgba(255, 0, 0, 0.2);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .rh-source-btn:hover {
                background: rgba(255, 0, 0, 0.3);
            }
            .rh-source-icon {
                width: 24px;
                height: 24px;
                margin-right: 8px;
            }
            .rh-source-title {
                font-size: 16px;
                font-weight: 500;
            }
        `
    };

    // Метод для получения видео
    plugin.source = function(callback, item) {
        console.log('[RH] Запрос видео для:', item.title);
        
        // Ваш реальный источник видео
        const videos = [{
            title: `${item.title} (RH Source)`,
            file: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            type: 'mp4',
            quality: '1080p'
        }];
        
        callback(videos);
    };

    // Регистрация плагина
    if(!window._plugins) window._plugins = [];
    window._plugins.push(plugin);

    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = plugin.style;
    document.head.appendChild(style);

    // Функция для добавления кнопки
    const addButton = () => {
        // Удаляем старую кнопку если есть
        const oldBtn = document.querySelector('.rh-source-btn');
        if(oldBtn) oldBtn.remove();

        // 1. Попробуем найти любой известный контейнер
        const containers = [
            '.selector__items',
            '.selectbox',
            '.source-selector',
            '.player__sources',
            '.player__controls',
            '.player--container'
        ];

        let container = null;
        for(const selector of containers) {
            container = document.querySelector(selector);
            if(container) break;
        }

        // 2. Если не нашли контейнер - создаем свой
        if(!container) {
            container = document.createElement('div');
            container.className = 'rh-source-container';
            container.style.position = 'fixed';
            container.style.bottom = '80px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // 3. Создаем кнопку
        const button = document.createElement('div');
        button.className = 'rh-source-btn';
        button.title = plugin.name;
        button.innerHTML = `
            <div class="rh-source-icon">${plugin.icon}</div>
            <div class="rh-source-title">${plugin.name}</div>
        `;

        // 4. Обработчик клика
        button.onclick = () => {
            const card = window.Lampa?.Storage?.get('card');
            if(card) {
                plugin.source((videos) => {
                    if(videos.length && window.Lampa?.Player?.play) {
                        window.Lampa.Player.play({
                            title: card.title,
                            files: videos
                        });
                    }
                }, card);
            }
        };

        // 5. Добавляем кнопку
        container.appendChild(button);
        console.log('[RH] Кнопка успешно добавлена');

        // 6. Периодическая проверка видимости
        const checkVisibility = () => {
            if(!document.contains(button)) {
                console.log('[RH] Кнопка удалена, добавляем снова');
                addButton();
            }
        };
        setInterval(checkVisibility, 3000);
    };

    // Запускаем после загрузки страницы
    const init = () => {
        // Первая попытка
        addButton();

        // Периодические проверки
        const interval = setInterval(() => {
            if(!document.querySelector('.rh-source-btn')) {
                addButton();
            }
        }, 5000);

        // Остановка после успешного добавления
        setTimeout(() => clearInterval(interval), 30000);
    };

    // Старт
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }
})();
