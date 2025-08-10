(function(){
    if(window.__rh_fixed_plugin) return;
    window.__rh_fixed_plugin = true;

    console.log('[RH FIXED PLUGIN] Initializing');

    // Конфигурация плагина
    const plugin = {
        id: "rh_fixed_source",
        name: "RH Видео", 
        type: "movie",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
        priority: 100
    };

    // Метод для получения видео
    plugin.source = function(callback, item) {
        console.log('[RH] Запрос видео для:', item.title);
        
        // Ваш реальный источник видео
        const videos = [{
            title: `${item.title} (RH)`,
            file: 'https://example.com/video.mp4', // Замените на реальный URL
            type: 'mp4',
            quality: '1080p'
        }];
        
        callback(videos);
    };

    // Регистрация плагина
    if(!window._plugins) window._plugins = [];
    window._plugins.push(plugin);

    // Основная функция добавления кнопки
    const addButton = () => {
        // 1. Находим контейнер с кнопкой "Трейлеры"
        const trailersBtn = document.querySelector('[data-type="trailer"], .selectbox [data-type="trailer"], .selector__item[data-type="trailer"]');
        
        if(!trailersBtn) {
            console.log('[RH] Кнопка трейлеров не найдена, повторная попытка через 1с');
            setTimeout(addButton, 1000);
            return;
        }

        // 2. Проверяем, не добавлена ли уже наша кнопка
        if(document.querySelector('[data-type="rh_source"]')) return;

        // 3. Клонируем кнопку трейлеров для нашего источника
        const button = trailersBtn.cloneNode(true);
        
        // 4. Модифицируем кнопку
        button.dataset.type = 'rh_source';
        button.innerHTML = `
            <div class="${button.classList.contains('selector__item') ? 'selector__item-icon' : 'selectbox__item-icon'}">
                ${plugin.icon}
            </div>
            <div class="${button.classList.contains('selector__item') ? 'selector__item-title' : 'selectbox__item-title'}">
                ${plugin.name}
            </div>
        `;

        // 5. Добавляем обработчик клика
        button.onclick = (e) => {
            e.stopPropagation();
            const card = Lampa.Storage.get('card');
            if(card) {
                plugin.source((videos) => {
                    if(videos.length) {
                        Lampa.Player.play({
                            title: card.title,
                            files: videos
                        });
                    }
                }, card);
            }
        };

        // 6. Вставляем кнопку сразу после трейлеров
        trailersBtn.parentNode.insertBefore(button, trailersBtn.nextSibling);
        console.log('[RH] Кнопка добавлена рядом с трейлерами');
    };

    // Запускаем после полной загрузки Lampa
    const init = () => {
        if(typeof Lampa === 'undefined') {
            setTimeout(init, 300);
            return;
        }

        // Первая попытка
        addButton();

        // Периодическая проверка (на случай динамического интерфейса)
        const checkInterval = setInterval(() => {
            if(!document.querySelector('[data-type="rh_source"]')) {
                addButton();
            } else {
                clearInterval(checkInterval);
            }
        }, 2000);
    };

    // Старт
    if(document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
