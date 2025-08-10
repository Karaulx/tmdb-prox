(function(){
    if(window.__rh_super_plugin) return;
    window.__rh_super_plugin = true;

    console.log('[RH SUPER PLUGIN] Initializing');

    // Конфигурация плагина
    const plugin = {
        id: "rh_super_plugin",
        name: "RH Видео", 
        type: "movie",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M18 9.5V6c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-13l-4 4zm-5 6V13H7v2.5L3.5 12 7 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/></svg>`,
        priority: 100
    };

    // Метод для поиска видео
    plugin.source = function(callback, item) {
        console.log('[RH] Поиск видео для:', item.title);
        
        // Здесь должен быть ваш код для получения видео
        const videos = [{
            title: `${item.title} (RH Source)`,
            file: 'https://example.com/video.mp4', // Замените на реальный URL
            type: 'mp4',
            quality: '1080p'
        }];
        
        callback(videos);
    };

    // Регистрация плагина
    if(!window._plugins) window._plugins = [];
    window._plugins.push(plugin);
    console.log('[RH] Плагин зарегистрирован');

    // Функция для добавления кнопки
    const addButton = () => {
        // Попробуем разные селекторы для разных версий Lampa
        const selectors = [
            '.selector__items', // Новая версия
            '.selectbox', // Старая версия
            '.source-selector', // Альтернативный вариант
            '.player__sources' // Еще один возможный вариант
        ];

        let container = null;
        for(const selector of selectors) {
            container = document.querySelector(selector);
            if(container) break;
        }

        if(!container) {
            console.log('[RH] Контейнер не найден, повторная попытка через 1 секунду');
            setTimeout(addButton, 1000);
            return;
        }

        // Проверяем, не добавлена ли уже кнопка
        if(document.querySelector('[data-type="rh_source"]')) {
            return;
        }

        // Создаем кнопку
        const button = document.createElement('div');
        button.className = container.classList.contains('selector__items') 
            ? 'selector__item' 
            : 'selectbox__item';
        button.dataset.type = 'rh_source';
        button.innerHTML = `
            <div class="${container.classList.contains('selector__items') 
                ? 'selector__item-icon' 
                : 'selectbox__item-icon'}">${plugin.icon}</div>
            <div class="${container.classList.contains('selector__items') 
                ? 'selector__item-title' 
                : 'selectbox__item-title'}">${plugin.name}</div>
        `;

        button.onclick = () => {
            const card = window.Lampa.Storage.get('card');
            if(card) {
                plugin.source((videos) => {
                    if(videos.length) {
                        window.Lampa.Player.play({
                            title: card.title,
                            files: videos
                        });
                    }
                }, card);
            }
        };

        // Добавляем кнопку в контейнер
        container.appendChild(button);
        console.log('[RH] Кнопка успешно добавлена в интерфейс');
    };

    // Запускаем добавление кнопки
    if(typeof Lampa !== 'undefined') {
        addButton();
    } else {
        const checkLampa = setInterval(() => {
            if(typeof Lampa !== 'undefined') {
                clearInterval(checkLampa);
                addButton();
            }
        }, 300);
    }

    // Дополнительная проверка после полной загрузки страницы
    window.addEventListener('load', () => {
        setTimeout(addButton, 3000);
    });

    // Периодическая проверка (на случай динамической загрузки интерфейса)
    setInterval(() => {
        if(!document.querySelector('[data-type="rh_source"]')) {
            addButton();
        }
    }, 5000);
})();
