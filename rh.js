(function(){
    if(window.__rh_ultimate_final) return;
    window.__rh_ultimate_final = true;

    console.log('[RH ULTIMATE FINAL] Initializing');

    const config = {
        name: "Смотреть на RH",
        icon: '▶️',
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnColor: "#FF2D2D"
    };

    // 1. Улучшенный стиль кнопки
    const style = document.createElement('style');
    style.textContent = `
        .rh-ultimate-btn {
            position: fixed !important;
            right: 20px !important;
            bottom: 80px !important;
            z-index: 99999 !important;
            background: ${config.btnColor} !important;
            color: white !important;
            padding: 12px 18px !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        .rh-ultimate-btn:hover {
            opacity: 0.9 !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Улучшенное получение данных карточки
    const getCardData = () => {
        // Все возможные способы получения данных
        const sources = [
            // Основной способ через Lampa
            () => window.Lampa?.Storage?.get('card'),
            
            // Из URL
            () => {
                const match = window.location.href.match(/\/(movie|tv)\/(\d+)/);
                return match ? {id: match[2], type: match[1]} : null;
            },
            
            // Из meta-тегов
            () => {
                const meta = document.querySelector('meta[property="tmdb:id"]');
                return meta ? {id: meta.content} : null;
            }
        ];

        // Пробуем все источники по очереди
        for(const source of sources) {
            try {
                const data = source();
                if(data?.id) return data;
            } catch(e) {}
        }
        
        return null;
    };

    // 3. Создание/обновление кнопки
    const updateButton = () => {
        const cardData = getCardData();
        let btn = document.querySelector('.rh-ultimate-btn');

        if(!btn) {
            btn = document.createElement('button');
            btn.className = 'rh-ultimate-btn';
            document.body.appendChild(btn);
        }

        if(cardData?.id) {
            btn.innerHTML = `${config.icon} ${config.name}`;
            btn.onclick = () => {
                const params = new URLSearchParams({
                    tmdb_id: cardData.id,
                    type: cardData.type || 'movie',
                    title: cardData.title || ''
                });
                window.open(`${config.apiUrl}?${params}`, '_blank');
            };
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    };

    // 4. Агрессивный мониторинг изменений
    const startWatching = () => {
        // Первая проверка
        updateButton();
        
        // Проверка при любых изменениях DOM
        const observer = new MutationObserver(updateButton);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        // Периодическая проверка
        setInterval(updateButton, 2000);
    };

    // 5. Запуск
    if(document.readyState === 'complete') {
        startWatching();
    } else {
        window.addEventListener('load', startWatching);
    }

    // Дублирующий запуск для надежности
    setTimeout(startWatching, 3000);
})();
