(function(){
    if(window.__rh_perfect_loader) return;
    window.__rh_perfect_loader = true;

    console.log('[RH PERFECT LOADER] Initializing');

    // 1. Конфигурация
    const config = {
        name: "▶️ RH Плеер",
        apiBase: "https://api4.rhhhhhhh.live",
        btnId: "rh-perfect-btn",
        retryDelay: 500,
        maxRetries: 20
    };

    // 2. Создаем кнопку в стиле Lampa
    const createButton = () => {
        const btn = document.createElement('div');
        btn.id = config.btnId;
        btn.className = 'selector__item'; // Используем классы Lampa
        btn.innerHTML = `
            <div class="selector__item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
            <div class="selector__item-title">${config.name}</div>
        `;
        btn.style.cssText = 'margin: 5px; cursor: pointer;';
        return btn;
    };

    // 3. Получаем точные данные карточки
    const getCardData = () => {
        try {
            // Основной способ через Lampa
            const card = window.Lampa.Storage.get('card');
            if(card?.id) {
                return {
                    id: card.id,
                    type: card.type || 'movie',
                    season: card.season,
                    episode: card.episode,
                    title: card.title || ''
                };
            }
        } catch(e) {
            console.error('Lampa Storage error:', e);
        }
        return null;
    };

    // 4. Формируем правильный URL для Lampa Player
    const getLampaPlayerUrl = (card) => {
        if(!card) return null;

        // Формат для Lampa:
        // {url: string, title: string, referer: string}
        return {
            url: `${config.apiBase}/play?tmdb_id=${card.id}&type=${card.type}` +
                 (card.season ? `&season=${card.season}` : '') +
                 (card.episode ? `&episode=${card.episode}` : ''),
            title: card.title,
            referer: window.location.href
        };
    };

    // 5. Встраиваем кнопку в интерфейс Lampa
    const init = (retryCount = 0) => {
        const card = getCardData();
        const playerData = getLampaPlayerUrl(card);

        // Ищем стандартный контейнер кнопок
        const container = document.querySelector('.selector__items, .full__buttons');
        
        if(container && playerData) {
            const btn = createButton();
            
            // Обработчик клика для Lampa Player
            btn.onclick = () => {
                console.log('Starting player with:', playerData);
                window.Lampa.Player.play({
                    title: playerData.title,
                    files: [{
                        title: playerData.title,
                        file: playerData.url,
                        type: 'video/mp4' // Или другой тип
                    }]
                });
            };

            // Вставляем кнопку
            container.appendChild(btn);
            console.log('Button successfully added');
            return;
        }

        if(retryCount < config.maxRetries) {
            setTimeout(() => init(retryCount + 1), config.retryDelay);
        } else {
            console.error('Failed to initialize after retries');
        }
    };

    // 6. Запускаем
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }
})();
