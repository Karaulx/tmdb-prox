(function(){
    if(window.__rh_absolute_loader) return;
    window.__rh_absolute_loader = true;

    console.log('[RH ABSOLUTE LOADER] Starting guaranteed integration');

    // 1. Конфигурация
    const config = {
        name: "▶️ RH Плеер",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnId: "rh-absolute-btn",
        maxWaitTime: 10000 // 10 секунд максимум
    };

    // 2. Создаем кнопку с гарантированным отображением
    const createButton = () => {
        let btn = document.getElementById(config.btnId);
        if(!btn) {
            btn = document.createElement('div');
            btn.id = config.btnId;
            btn.style.cssText = `
                position: fixed !important;
                right: 20px !important;
                bottom: 80px !important;
                z-index: 2147483647 !important;
                background: linear-gradient(135deg, #FF0000, #FF4500) !important;
                color: white !important;
                padding: 12px 24px !important;
                border-radius: 12px !important;
                font-size: 16px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                border: none !important;
                box-shadow: 0 6px 24px rgba(255, 0, 0, 0.4) !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
            `;
            btn.innerHTML = `<span style="font-size:20px">▶️</span> ${config.name}`;
            document.body.appendChild(btn);
        }
        return btn;
    };

    // 3. Получаем данные карточки агрессивным методом
    const getCardData = () => {
        // Все возможные способы получения данных
        const sources = [
            () => window.Lampa?.Storage?.get('card'),
            () => {
                const match = window.location.href.match(/\/(movie|tv)\/(\d+)/);
                return match ? {id: match[2], type: match[1]} : null;
            },
            () => {
                const meta = document.querySelector('meta[property="tmdb:id"]');
                return meta ? {id: meta.content} : null;
            },
            () => {
                const player = document.querySelector('.player__container');
                return player?.dataset?.id ? {id: player.dataset.id} : null;
            }
        ];

        for(let source of sources) {
            try {
                const data = source();
                if(data?.id) {
                    return {
                        id: data.id,
                        type: data.type || 'movie',
                        title: data.title || ''
                    };
                }
            } catch(e) {
                console.error('Error in source:', e);
            }
        }
        return null;
    };

    // 4. Основная функция
    const init = (startTime = Date.now()) => {
        const btn = createButton();
        const card = getCardData();

        if(card?.id) {
            // Настройка кнопки при успехе
            btn.onclick = () => {
                const params = new URLSearchParams({
                    tmdb_id: card.id,
                    type: card.type,
                    title: encodeURIComponent(card.title),
                    _: Date.now()
                });
                
                // Запуск через Lampa Player если доступен
                if(window.Lampa?.Player?.play) {
                    window.Lampa.Player.play({
                        title: card.title,
                        files: [{
                            title: card.title,
                            file: `${config.apiUrl}?${params}`,
                            type: 'video/mp4'
                        }]
                    });
                } else {
                    window.open(`${config.apiUrl}?${params}`, '_blank');
                }
            };
            
            console.log('Successfully initialized with ID:', card.id);
            return;
        }

        if(Date.now() - startTime < config.maxWaitTime) {
            setTimeout(() => init(startTime), 500);
        } else {
            btn.onclick = () => alert('Не удалось загрузить данные. Пожалуйста:\n1. Полностью откройте карточку\n2. Обновите страницу (Ctrl+F5)');
            console.error('Failed to initialize after timeout');
        }
    };

    // 5. Запуск
    if(document.readyState === 'complete') {
        setTimeout(init, 500);
    } else {
        window.addEventListener('load', () => setTimeout(init, 500));
    }

    // Дублирующий запуск через 3 секунды
    setTimeout(init, 3000);
})();
