(function(){
    if(window.__rh_ultimate_button) return;
    window.__rh_ultimate_button = true;

    console.log('[RH ULTIMATE BUTTON] Initializing');

    // 1. Конфигурация
    const config = {
        name: "▶️ RH Плеер",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnClass: "rh-ultimate-button",
        maxAttempts: 20,
        delay: 500
    };

    // 2. Создаем кнопку в стиле Lampa
    const createButton = () => {
        const btn = document.createElement('div');
        btn.className = `selector__item ${config.btnClass}`;
        btn.innerHTML = `
            <div class="selector__item-icon">
                <svg height="24" viewBox="0 0 24 24" width="24" fill="#FF0000">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
            <div class="selector__item-title">${config.name}</div>
        `;
        btn.style.cssText = 'margin: 5px; cursor: pointer;';
        return btn;
    };

    // 3. Получаем данные карточки
    const getCardData = () => {
        try {
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
            console.error('Error getting card data:', e);
        }
        return null;
    };

    // 4. Вставляем кнопку в интерфейс
    const insertButton = (attempt = 0) => {
        const card = getCardData();
        const container = document.querySelector('.selector__items, .full__buttons');
        
        if(container) {
            // Удаляем старую кнопку если есть
            const oldBtn = document.querySelector(`.${config.btnClass}`);
            if(oldBtn) oldBtn.remove();
            
            const btn = createButton();
            
            // Назначаем обработчик клика
            if(card?.id) {
                btn.onclick = () => {
                    const params = new URLSearchParams({
                        tmdb_id: card.id,
                        type: card.type,
                        season: card.season || '',
                        episode: card.episode || '',
                        title: encodeURIComponent(card.title),
                        _: Date.now()
                    });
                    
                    // Запуск через Lampa Player
                    window.Lampa.Player.play({
                        title: card.title,
                        files: [{
                            title: card.title,
                            file: `${config.apiUrl}?${params}`,
                            type: 'video/mp4'
                        }]
                    });
                };
            } else {
                btn.onclick = () => alert('Данные карточки не загружены. Пожалуйста, полностью откройте карточку.');
            }
            
            container.appendChild(btn);
            console.log('Button successfully added to interface');
            return true;
        }

        if(attempt < config.maxAttempts) {
            setTimeout(() => insertButton(attempt + 1), config.delay);
        } else {
            console.error('Failed to find container after attempts');
            return false;
        }
    };

    // 5. Альтернативный метод - fixed кнопка
    const createFixedButton = (card) => {
        const btn = document.createElement('div');
        btn.className = config.btnClass;
        btn.style.cssText = `
            position: fixed !important;
            right: 20px !important;
            bottom: 80px !important;
            z-index: 9999 !important;
            background: #FF0000 !important;
            color: white !important;
            padding: 12px 18px !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        `;
        btn.textContent = config.name;
        
        if(card?.id) {
            btn.onclick = () => {
                const params = new URLSearchParams({
                    tmdb_id: card.id,
                    type: card.type,
                    season: card.season || '',
                    episode: card.episode || '',
                    _: Date.now()
                });
                window.open(`${config.apiUrl}?${params}`, '_blank');
            };
        } else {
            btn.onclick = () => alert('Данные не загружены. Откройте карточку полностью.');
        }
        
        document.body.appendChild(btn);
        console.log('Fixed button created as fallback');
    };

    // 6. Основная инициализация
    const init = () => {
        const card = getCardData();
        
        // Сначала пробуем встроить кнопку в интерфейс
        if(!insertButton()) {
            // Если не получилось - создаем fixed кнопку
            createFixedButton(card);
        }
    };

    // 7. Запускаем
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }

    // Дублирующий запуск через 5 секунд
    setTimeout(init, 5000);
})();
