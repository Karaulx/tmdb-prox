(function(){
    if(window.__rh_reyohoho_launcher) return;
    window.__rh_reyohoho_launcher = true;

    console.log('[RH REYOHOHO LAUNCHER] Initializing');

    // Конфигурация
    const config = {
        id: "rh_reyohoho",
        name: "Смотреть", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M8 5v14l11-7z"/></svg>`,
        reyohohoUrl: "https://reyohoho.ru/player", // Ваш сайт
        style: `
            .rh-reyohoho-btn {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                margin: 5px;
                background: rgba(255, 40, 40, 0.15);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .rh-reyohoho-btn:hover {
                background: rgba(255, 40, 40, 0.25);
            }
            .rh-reyohoho-icon {
                width: 24px;
                height: 24px;
                margin-right: 8px;
            }
        `
    };

    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = config.style;
    document.head.appendChild(style);

    // Функция создания кнопки
    const createButton = () => {
        // Удаляем старую кнопку если есть
        const oldBtn = document.querySelector('.rh-reyohoho-btn');
        if(oldBtn) oldBtn.remove();

        // Ищем контейнер для кнопки
        let container = document.querySelector('.selector__items, .selectbox, .player__sources');
        
        // Если контейнер не найден, создаем свой
        if(!container) {
            container = document.createElement('div');
            container.className = 'rh-reyohoho-container';
            container.style.position = 'fixed';
            container.style.bottom = '80px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // Создаем кнопку
        const button = document.createElement('div');
        button.className = 'rh-reyohoho-btn';
        button.innerHTML = `
            <div class="rh-reyohoho-icon">${config.icon}</div>
            <div>${config.name}</div>
        `;

        // Обработчик клика
        button.onclick = () => {
            const card = window.Lampa?.Storage?.get('card');
            if(!card || !card.id) return;

            // Формируем URL для reyohoho
            const url = new URL(config.reyohohoUrl);
            url.searchParams.append('tmdb_id', card.id);
            url.searchParams.append('type', card.type === 'movie' ? 'movie' : 'tv');
            url.searchParams.append('title', encodeURIComponent(card.title));

            // Открываем в новом окне или iframe
            window.open(url.toString(), '_blank');
        };

        container.appendChild(button);
    };

    // Инициализация
    const init = () => {
        createButton();
        
        // Периодически проверяем наличие кнопки
        setInterval(() => {
            if(!document.querySelector('.rh-reyohoho-btn')) {
                createButton();
            }
        }, 5000);
    };

    // Запускаем после загрузки страницы
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }
})();
