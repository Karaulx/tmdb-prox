(function(){
    if(window.__rh_api_connector) return;
    window.__rh_api_connector = true;

    console.log('[RH API CONNECTOR] Initializing');

    // Конфигурация
    const config = {
        id: "rh_api_player",
        name: "Смотреть на RH", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M8 5v14l11-7z"/></svg>`,
        apiUrl: "https://api4.rhhhhhhh.live/play", // Ваш API endpoint
        style: `
            .rh-api-btn {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                margin: 5px;
                background: rgba(255, 40, 40, 0.2);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: 500;
            }
            .rh-api-btn:hover {
                background: rgba(255, 40, 40, 0.3);
            }
            .rh-api-icon {
                width: 20px;
                height: 20px;
                margin-right: 8px;
            }
        `
    };

    // Добавляем стили
    const addStyles = () => {
        const style = document.createElement('style');
        style.textContent = config.style;
        document.head.appendChild(style);
    };

    // Получаем данные карточки
    const getCardData = () => {
        try {
            // Основной способ через Lampa Storage
            const card = window.Lampa?.Storage?.get('card') || {};
            
            // Резервные способы если Lampa не доступна
            if(!card.id) {
                const fromUrl = window.location.href.match(/(movie|tv)\/(\d+)/);
                if(fromUrl) {
                    card.id = fromUrl[2];
                    card.type = fromUrl[1] === 'movie' ? 'movie' : 'tv';
                }
            }
            
            return card;
        } catch(e) {
            console.error('Error getting card data:', e);
            return {};
        }
    };

    // Создаем кнопку
    const createButton = () => {
        // Удаляем старую кнопку если есть
        const oldBtn = document.querySelector('.rh-api-btn');
        if(oldBtn) oldBtn.remove();

        // Ищем подходящий контейнер
        const containers = [
            '.selector__items',
            '.selectbox', 
            '.player__sources',
            '.full__buttons'
        ];
        
        let container = null;
        for(const selector of containers) {
            container = document.querySelector(selector);
            if(container) break;
        }

        // Создаем свой контейнер если не нашли
        if(!container) {
            container = document.createElement('div');
            container.className = 'rh-api-container';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // Создаем кнопку
        const button = document.createElement('div');
        button.className = 'rh-api-btn';
        button.innerHTML = `
            <div class="rh-api-icon">${config.icon}</div>
            <div>${config.name}</div>
        `;

        // Обработчик клика
        button.onclick = async () => {
            const card = getCardData();
            if(!card.id) {
                alert('Не удалось получить ID карточки');
                return;
            }

            // Формируем параметры запроса
            const params = new URLSearchParams();
            params.append('tmdb_id', card.id);
            params.append('type', card.type || 'movie');
            if(card.season) params.append('season', card.season);
            if(card.episode) params.append('episode', card.episode);

            try {
                // Отправляем запрос к вашему API
                const response = await fetch(`${config.apiUrl}?${params.toString()}`);
                const data = await response.json();
                
                // Обрабатываем ответ
                if(data.url) {
                    // Если API возвращает прямую ссылку
                    window.open(data.url, '_blank');
                } else if(data.error) {
                    alert(`Ошибка: ${data.error}`);
                }
            } catch(e) {
                console.error('API request failed:', e);
                alert('Ошибка соединения с API');
            }
        };

        container.appendChild(button);
    };

    // Инициализация
    const init = () => {
        addStyles();
        createButton();
        
        // Периодическая проверка (на случай динамического интерфейса)
        setInterval(() => {
            if(!document.querySelector('.rh-api-btn')) {
                createButton();
            }
        }, 5000);
    };

    // Запуск
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }
})();
