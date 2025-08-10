(function(){
    // Защита от дублирования
    if(window.__rh_ultimate_v5) return;
    window.__rh_ultimate_v5 = true;

    console.log('[RH ULTIMATE v5] Initializing');

    // Конфигурация плагина
    const plugin = {
        id: "rh_ultimate",
        name: "RH Видео", 
        type: "movie",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M18 9.5V6c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-13l-4 4zm-5 6V13H7v2.5L3.5 12 7 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/></svg>`,
        priority: 100
    };

    // Метод для поиска видео
    plugin.source = function(callback, item) {
        console.log('[RH] Поиск видео для:', item.title);
        
        // Ваш код для получения видео
        const videos = [{
            title: `${item.title} (RH Source)`,
            file: 'https://example.com/video.mp4',
            type: 'mp4',
            quality: '1080p'
        }];
        
        callback(videos);
    };

    // Регистрация плагина
    if(!window._plugins) window._plugins = [];
    window._plugins.push(plugin);
    console.log('[RH] Плагин зарегистрирован');

    // Создаем кнопку в интерфейсе
    const createButton = () => {
        const container = document.querySelector('.selector__items');
        if(!container) {
            setTimeout(createButton, 500);
            return;
        }

        // Проверяем, не добавлена ли уже кнопка
        if(document.querySelector('.selector__item[data-type="rh_source"]')) return;

        const button = document.createElement('div');
        button.className = 'selector__item';
        button.dataset.type = 'rh_source';
        button.innerHTML = `
            <div class="selector__item-icon">${plugin.icon}</div>
            <div class="selector__item-title">${plugin.name}</div>
        `;

        button.onclick = () => {
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

        container.appendChild(button);
        console.log('[RH] Кнопка добавлена в интерфейс');
    };

    // Запускаем создание кнопки
    if(typeof Lampa !== 'undefined') {
        createButton();
    } else {
        const checkLampa = setInterval(() => {
            if(typeof Lampa !== 'undefined') {
                clearInterval(checkLampa);
                createButton();
            }
        }, 300);
    }

    // Альтернативный метод для старых версий Lampa
    const fallbackMethod = () => {
        const sourceBtn = document.querySelector('[data-type="source"]');
        if(sourceBtn) {
            const rhBtn = sourceBtn.cloneNode(true);
            rhBtn.dataset.type = 'rh_source';
            rhBtn.querySelector('.selectbox__item-title').textContent = plugin.name;
            rhBtn.onclick = () => {
                const card = Lampa.Storage.get('card');
                if(card) plugin.source((v) => v.length && Lampa.Player.play({
                    title: card.title,
                    files: v
                }), card);
            };
            sourceBtn.after(rhBtn);
        } else {
            setTimeout(fallbackMethod, 500);
        }
    };

    setTimeout(fallbackMethod, 2000);
})();
